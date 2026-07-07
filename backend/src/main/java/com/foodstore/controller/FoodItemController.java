package com.foodstore.controller;

import com.foodstore.dto.FoodItemDto;
import com.foodstore.service.FoodItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/food-items")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @GetMapping
    public ResponseEntity<List<FoodItemDto>> search(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(foodItemService.search(categoryId, minPrice, maxPrice, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getById(id));
    }
}
