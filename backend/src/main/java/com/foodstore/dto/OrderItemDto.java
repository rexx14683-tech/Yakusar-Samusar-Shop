package com.foodstore.dto;

import java.math.BigDecimal;

public class OrderItemDto {

    private Long foodItemId;
    private String foodItemName;
    private int quantity;
    private BigDecimal price;

    public OrderItemDto() {
    }

    public OrderItemDto(Long foodItemId, String foodItemName, int quantity, BigDecimal price) {
        this.foodItemId = foodItemId;
        this.foodItemName = foodItemName;
        this.quantity = quantity;
        this.price = price;
    }

    public Long getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public String getFoodItemName() {
        return foodItemName;
    }

    public void setFoodItemName(String foodItemName) {
        this.foodItemName = foodItemName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
