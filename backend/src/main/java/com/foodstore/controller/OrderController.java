package com.foodstore.controller;

import com.foodstore.dto.OrderDto;
import com.foodstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderDto> checkout(Authentication authentication) {
        return ResponseEntity.ok(orderService.checkout(CurrentUser.id(authentication)));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrdersForUser(CurrentUser.id(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getMyOrder(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderForUser(CurrentUser.id(authentication), id));
    }
}
