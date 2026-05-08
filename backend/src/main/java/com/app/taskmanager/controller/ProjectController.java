package com.app.taskmanager.controller;

import com.app.taskmanager.dto.DTOs.ProjectRequest;
import com.app.taskmanager.model.Project;
import com.app.taskmanager.model.Role;
import com.app.taskmanager.model.User;
import com.app.taskmanager.repository.ProjectRepository;
import com.app.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (user.getRole() == Role.ROLE_ADMIN) {
            return ResponseEntity.ok(projectRepository.findAll());
        }
        return ResponseEntity.ok(projectRepository.findByMembersId(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> createProject(@RequestBody ProjectRequest request, Authentication auth) {
        User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        
        List<User> members = userRepository.findAllById(request.memberIds());
        
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .createdBy(admin)
                .members(new HashSet<>(members))
                .build();

        return ResponseEntity.ok(projectRepository.save(project));
    }
}