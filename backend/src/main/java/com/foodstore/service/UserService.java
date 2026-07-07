package com.foodstore.service;

import com.foodstore.dto.UserDto;
import com.foodstore.exception.ResourceNotFoundException;
import com.foodstore.model.User;
import com.foodstore.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto getById(Long id) {
        return toDto(findEntity(id));
    }

    public List<UserDto> getAll() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public UserDto updateActiveStatus(Long id, boolean active) {
        User user = findEntity(id);
        user.setActive(active);
        return toDto(userRepository.save(user));
    }

    public UserDto updateProfile(Long id, String name, String phone) {
        User user = findEntity(id);
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        user.setPhone(phone);
        return toDto(userRepository.save(user));
    }

    private User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
