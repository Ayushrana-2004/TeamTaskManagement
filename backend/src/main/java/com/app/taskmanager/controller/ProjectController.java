package com.app.taskmanager.controller;

import java.util.HashSet;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.taskmanager.dto.DTOs.ProjectRequest;
import com.app.taskmanager.model.Project;
import com.app.taskmanager.model.Role;
import com.app.taskmanager.model.User;
import com.app.taskmanager.repository.ProjectRepository;
import com.app.taskmanager.repository.TaskRepository;
import com.app.taskmanager.repository.UserRepository;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

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

        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setCreatedBy(admin);
        project.setMembers(new HashSet<>(members));

        return ResponseEntity.ok(projectRepository.save(project));
    }

    @DeleteMapping("/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId) {
        taskRepository.deleteByProjectId(projectId);
        projectRepository.deleteById(projectId);
        return ResponseEntity.ok("Project deleted");
    }
}
