package com.app.taskmanager.dto;

import com.app.taskmanager.model.Role;
import com.app.taskmanager.model.TaskStatus;
import java.util.List;

public class DTOs {
    public record RegisterRequest(String name, String email, String password, Role role) {}
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token, Long id, String name, String email, Role role) {}
    
    public record ProjectRequest(String name, String description, List<Long> memberIds) {}
    public record TaskRequest(String title, String description, Long assignedToId) {}
    public record TaskStatusRequest(TaskStatus status) {}
}