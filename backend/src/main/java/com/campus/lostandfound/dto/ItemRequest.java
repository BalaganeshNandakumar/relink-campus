package com.campus.lostandfound.dto;

import java.time.LocalDate;

import com.campus.lostandfound.model.ItemType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ItemRequest {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotBlank(message = "Category cannot be blank")
    private String category;

    @NotBlank(message = "Location cannot be blank")
    private String location;

    @NotNull(message = "Date cannot be null")
    private LocalDate date;

    @NotNull(message = "Item type cannot be null")
    private ItemType type;

    public ItemRequest() {
    }

    public ItemRequest(String title, String description, String category, String location, LocalDate date, ItemType type) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.date = date;
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }
}
