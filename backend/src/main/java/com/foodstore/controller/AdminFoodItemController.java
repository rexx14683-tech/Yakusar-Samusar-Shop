package com.foodstore.controller;

import com.foodstore.dto.FoodItemDto;
import com.foodstore.dto.FoodItemRequest;
import com.foodstore.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/food-items")
public class AdminFoodItemController {

    private final FoodItemService foodItemService;

    public AdminFoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<FoodItemDto> create(@Valid @ModelAttribute FoodItemRequest request,
                                               @RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(foodItemService.create(request, image));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<FoodItemDto> update(@PathVariable Long id,
                                               @Valid @ModelAttribute FoodItemRequest request,
                                               @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(foodItemService.update(id, request, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        foodItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
