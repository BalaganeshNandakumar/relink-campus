package com.campus.lostandfound.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.lostandfound.dto.ItemRequest;
import com.campus.lostandfound.dto.ItemResponse;
import com.campus.lostandfound.model.ItemStatus;
import com.campus.lostandfound.model.ItemType;
import com.campus.lostandfound.security.UserPrincipal;
import com.campus.lostandfound.service.ItemService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ItemResponse> createItem(
            @Valid @RequestBody ItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ItemResponse response = itemService.createItem(request, currentUser.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllItems() {
        List<ItemResponse> items = itemService.getAllItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemResponse>> searchItems(
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ItemStatus status) {
        List<ItemResponse> items = itemService.searchItems(type, category, location, status);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        ItemResponse response = itemService.getItemById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ItemResponse response = itemService.updateItem(id, request, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        itemService.deleteItem(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<ItemResponse> claimItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ItemResponse response = itemService.claimItem(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ItemResponse> returnItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ItemResponse response = itemService.returnItem(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }
}
