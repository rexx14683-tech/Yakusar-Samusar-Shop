package com.foodstore.controller;

import com.foodstore.dto.AddToCartRequest;
import com.foodstore.dto.CartDto;
import com.foodstore.dto.UpdateCartItemRequest;
import com.foodstore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(CurrentUser.id(authentication)));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(Authentication authentication, @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addItem(CurrentUser.id(authentication), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateItem(Authentication authentication, @PathVariable Long itemId,
                                               @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItem(CurrentUser.id(authentication), itemId, request.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItem(Authentication authentication, @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(CurrentUser.id(authentication), itemId));
    }
}
