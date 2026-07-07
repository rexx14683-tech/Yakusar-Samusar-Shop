package com.foodstore.controller;

import com.foodstore.dto.UpdateUserStatusRequest;
import com.foodstore.dto.UserDto;
import com.foodstore.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserDto> updateStatus(@PathVariable Long id, @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(userService.updateActiveStatus(id, request.isActive()));
    }
}
