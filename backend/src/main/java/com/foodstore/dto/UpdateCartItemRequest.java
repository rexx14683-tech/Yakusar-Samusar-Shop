package com.foodstore.dto;

import jakarta.validation.constraints.Positive;

public class UpdateCartItemRequest {

    @Positive
    private int quantity;

    public UpdateCartItemRequest() {
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
