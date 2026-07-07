package com.foodstore.service;

import com.foodstore.dto.FoodItemDto;
import com.foodstore.dto.FoodItemRequest;
import com.foodstore.exception.ResourceNotFoundException;
import com.foodstore.model.Category;
import com.foodstore.model.FoodItem;
import com.foodstore.repository.CategoryRepository;
import com.foodstore.repository.FoodItemRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public FoodItemService(FoodItemRepository foodItemRepository, CategoryRepository categoryRepository,
                            FileStorageService fileStorageService) {
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<FoodItemDto> search(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String keyword) {
        Specification<FoodItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (keyword != null && !keyword.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return foodItemRepository.findAll(spec).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public FoodItemDto getById(Long id) {
        return toDto(findEntity(id));
    }

    @Transactional
    public FoodItemDto create(FoodItemRequest request, MultipartFile image) {
        FoodItem item = new FoodItem();
        applyRequest(item, request);
        item.setImageUrl(fileStorageService.store(image));
        return toDto(foodItemRepository.save(item));
    }

    @Transactional
    public FoodItemDto update(Long id, FoodItemRequest request, MultipartFile image) {
        FoodItem item = findEntity(id);
        applyRequest(item, request);

        if (image != null && !image.isEmpty()) {
            String oldImage = item.getImageUrl();
            item.setImageUrl(fileStorageService.store(image));
            fileStorageService.delete(oldImage);
        }

        return toDto(foodItemRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        FoodItem item = findEntity(id);
        fileStorageService.delete(item.getImageUrl());
        foodItemRepository.delete(item);
    }

    private void applyRequest(FoodItem item, FoodItemRequest request) {
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setAvailable(request.isAvailable());
        item.setStockQuantity(request.getStockQuantity());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + request.getCategoryId()));
            item.setCategory(category);
        } else {
            item.setCategory(null);
        }
    }

    private FoodItem findEntity(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id " + id));
    }

    private FoodItemDto toDto(FoodItem item) {
        return new FoodItemDto(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.getImageUrl(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.isAvailable(),
                item.getStockQuantity(),
                item.getCreatedAt()
        );
    }
}
