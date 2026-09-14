package com.campus.lostandfound.dto;

import java.time.LocalDate;

import com.campus.lostandfound.model.ItemStatus;
import com.campus.lostandfound.model.ItemType;

public class ItemResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String location;
    private LocalDate date;
    private ItemType type;
    private ItemStatus status;
    private Long userId;
    private Long claimedByUserId;

    public ItemResponse() {
    }

    public ItemResponse(Long id, String title, String description, String category, String location, LocalDate date, ItemType type, ItemStatus status, Long userId) {
        this(id, title, description, category, location, date, type, status, userId, null);
    }

    public ItemResponse(Long id, String title, String description, String category, String location, LocalDate date, ItemType type, ItemStatus status, Long userId, Long claimedByUserId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.date = date;
        this.type = type;
        this.status = status;
        this.userId = userId;
        this.claimedByUserId = claimedByUserId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String location() {
        return location;
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

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getClaimedByUserId() {
        return claimedByUserId;
    }

    public void setClaimedByUserId(Long claimedByUserId) {
        this.claimedByUserId = claimedByUserId;
    }
}
