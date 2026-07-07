package com.foodstore.service;

import com.foodstore.dto.OrderDto;
import com.foodstore.dto.OrderItemDto;
import com.foodstore.exception.BadRequestException;
import com.foodstore.exception.ResourceNotFoundException;
import com.foodstore.model.*;
import com.foodstore.repository.CartItemRepository;
import com.foodstore.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                         CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.cartService = cartService;
    }

    @Transactional
    public OrderDto checkout(Long userId) {
        Cart cart = cartService.findOrCreateCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        Order order = new Order();
        order.setUser(cart.getUser());
        order.setStatus(OrderStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            FoodItem foodItem = cartItem.getFoodItem();

            if (!foodItem.isAvailable() || foodItem.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for item: " + foodItem.getName());
            }

            foodItem.setStockQuantity(foodItem.getStockQuantity() - cartItem.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFoodItem(foodItem);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(foodItem.getPrice());
            orderItems.add(orderItem);

            total = total.add(foodItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);
        order = orderRepository.save(order);

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();

        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersForUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderForUser(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("This order does not belong to you");
        }
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public OrderDto updateStatus(Long orderId, String statusValue) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + orderId));

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(statusValue.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + statusValue);
        }

        order.setStatus(status);
        return toDto(orderRepository.save(order));
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> items = order.getItems().stream()
                .map(i -> new OrderItemDto(i.getFoodItem().getId(), i.getFoodItem().getName(), i.getQuantity(), i.getPrice()))
                .toList();

        return new OrderDto(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getName(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                items
        );
    }
}
