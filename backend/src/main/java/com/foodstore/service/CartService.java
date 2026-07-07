package com.foodstore.service;

import com.foodstore.dto.AddToCartRequest;
import com.foodstore.dto.CartDto;
import com.foodstore.dto.CartItemDto;
import com.foodstore.exception.BadRequestException;
import com.foodstore.exception.ResourceNotFoundException;
import com.foodstore.model.Cart;
import com.foodstore.model.CartItem;
import com.foodstore.model.FoodItem;
import com.foodstore.repository.CartItemRepository;
import com.foodstore.repository.CartRepository;
import com.foodstore.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final FoodItemRepository foodItemRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                        FoodItemRepository foodItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @Transactional(readOnly = true)
    public CartDto getCart(Long userId) {
        return toDto(findOrCreateCart(userId));
    }

    @Transactional
    public CartDto addItem(Long userId, AddToCartRequest request) {
        Cart cart = findOrCreateCart(userId);
        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id " + request.getFoodItemId()));

        if (!foodItem.isAvailable()) {
            throw new BadRequestException("This item is currently unavailable");
        }

        CartItem existing = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), foodItem.getId()).orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
            cartItemRepository.save(existing);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setFoodItem(foodItem);
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }

        return toDto(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public CartDto updateItem(Long userId, Long cartItemId, int quantity) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to you");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return toDto(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public CartDto removeItem(Long userId, Long cartItemId) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to you");
        }

        cartItemRepository.delete(item);
        return toDto(cartRepository.findById(cart.getId()).orElseThrow());
    }

    Cart findOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            throw new ResourceNotFoundException("Cart not found for user " + userId);
        });
    }

    private CartDto toDto(Cart cart) {
        BigDecimal total = BigDecimal.ZERO;
        java.util.List<CartItemDto> items = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            BigDecimal lineTotal = item.getFoodItem().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(lineTotal);
            items.add(new CartItemDto(
                    item.getId(),
                    item.getFoodItem().getId(),
                    item.getFoodItem().getName(),
                    item.getFoodItem().getImageUrl(),
                    item.getFoodItem().getPrice(),
                    item.getQuantity(),
                    lineTotal
            ));
        }

        return new CartDto(cart.getId(), items, total);
    }
}
