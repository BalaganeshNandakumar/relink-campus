package com.campus.lostandfound.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.campus.lostandfound.dto.ItemRequest;
import com.campus.lostandfound.dto.ItemResponse;
import com.campus.lostandfound.exception.InvalidItemStatusException;
import com.campus.lostandfound.exception.ItemNotFoundException;
import com.campus.lostandfound.exception.UnauthorizedItemAccessException;
import com.campus.lostandfound.exception.UnauthorizedItemActionException;
import com.campus.lostandfound.exception.UserNotFoundException;
import com.campus.lostandfound.model.Item;
import com.campus.lostandfound.model.ItemStatus;
import com.campus.lostandfound.model.ItemType;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.ItemSpecification;
import com.campus.lostandfound.repository.UserRepository;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemService(ItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    public ItemResponse createItem(ItemRequest request, Long authenticatedUserId) {
        // Find the authenticated User; throw 404 if not found
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + authenticatedUserId));

        // Create Item and populate fields
        Item item = new Item();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setDate(request.getDate());
        item.setType(request.getType());
        item.setStatus(ItemStatus.ACTIVE);
        item.setUser(user);

        // Save Item to PostgreSQL
        Item savedItem = itemRepository.save(item);

        return mapToItemResponse(savedItem);
    }

    public List<ItemResponse> getAllItems() {
        // Retrieve all items from PostgreSQL and map to ItemResponse list
        return itemRepository.findAll().stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(Long id) {
        // Retrieve single item by ID from PostgreSQL or throw 404
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + id));
        return mapToItemResponse(item);
    }

    public List<ItemResponse> searchItems(ItemType type, String category, String location, ItemStatus status) {
        // Apply dynamic filter specification across multiple optional parameters
        Specification<Item> spec = ItemSpecification.filterItems(type, category, location, status);
        return itemRepository.findAll(spec).stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse updateItem(Long itemId, ItemRequest request, Long authenticatedUserId) {
        // 1. Find the item; throw 404 if not found
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + itemId));

        // 2. Verify ownership: the authenticated user must be the item owner
        if (!item.getUser().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedItemAccessException("You are not allowed to update this item");
        }

        // 3. Update editable fields only (do NOT touch id, status, or user)
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setDate(request.getDate());
        item.setType(request.getType());

        // 4. Persist updated item to PostgreSQL
        Item updatedItem = itemRepository.save(item);

        return mapToItemResponse(updatedItem);
    }

    public void deleteItem(Long itemId, Long authenticatedUserId) {
        // 1. Find the item; throw 404 if not found
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + itemId));

        // 2. Verify ownership: the authenticated user must be the item owner
        if (!item.getUser().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedItemAccessException("You are not allowed to delete this item");
        }

        // 3. Delete the item from PostgreSQL (does not delete the User)
        itemRepository.delete(item);
    }

    public ItemResponse claimItem(Long itemId, Long authenticatedUserId) {
        // 1. Find the item by ID; throw 404 if not found
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + itemId));

        // 2. Find the authenticated user; throw 404 if not found
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + authenticatedUserId));

        // 3. The item must currently have status ACTIVE
        if (item.getStatus() != ItemStatus.ACTIVE) {
            throw new InvalidItemStatusException("Item cannot be claimed because its current status is: " + item.getStatus());
        }

        // 4. The user claiming the item must NOT be the person who originally reported it
        if (item.getUser().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedItemActionException("The reporter cannot claim their own item");
        }

        // 5. Update claimedBy user, set status to CLAIMED, and save
        item.setClaimedBy(user);
        item.setStatus(ItemStatus.CLAIMED);
        Item savedItem = itemRepository.save(item);

        return mapToItemResponse(savedItem);
    }

    public ItemResponse returnItem(Long itemId, Long authenticatedUserId) {
        // 1. Find the item by ID; throw 404 if not found
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + itemId));

        // 2. Verify user existence
        userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + authenticatedUserId));

        // 3. The item must currently have status CLAIMED
        if (item.getStatus() != ItemStatus.CLAIMED) {
            throw new InvalidItemStatusException("Item cannot be marked as returned because its current status is: " + item.getStatus());
        }

        // 4. Only the user who claimed the item should be allowed to mark it as returned
        if (item.getClaimedBy() == null || !item.getClaimedBy().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedItemActionException("Only the user who claimed the item can mark it as returned");
        }

        // 5. Change status from CLAIMED to RETURNED and save
        item.setStatus(ItemStatus.RETURNED);
        Item savedItem = itemRepository.save(item);

        return mapToItemResponse(savedItem);
    }

    private ItemResponse mapToItemResponse(Item item) {
        Long claimedByUserId = (item.getClaimedBy() != null) ? item.getClaimedBy().getId() : null;
        return new ItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getCategory(),
                item.getLocation(),
                item.getDate(),
                item.getType(),
                item.getStatus(),
                item.getUser().getId(),
                claimedByUserId
        );
    }
}
