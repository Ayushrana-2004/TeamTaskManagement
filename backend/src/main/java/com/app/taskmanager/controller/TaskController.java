package com.app.taskmanager.controller;

import com.app.taskmanager.dto.DTOs.TaskRequest;
import com.app.taskmanager.dto.DTOs.TaskStatusRequest;
import com.app.taskmanager.model.Project;
import com.app.taskmanager.model.Task;
import com.app.taskmanager.model.TaskStatus;
import com.app.taskmanager.model.User;
import com.app.taskmanager.repository.ProjectRepository;
import com.app.taskmanager.repository.TaskRepository;
import com.app.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<Task>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskRepository.findByProjectId(projectId));
    }

    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@PathVariable Long projectId, @RequestBody TaskRequest request) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        User assignee = userRepository.findById(request.assignedToId()).orElseThrow();

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .status(TaskStatus.TODO)
                .project(project)
                .assignedTo(assignee)
                .build();

        return ResponseEntity.ok(taskRepository.save(task));
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestBody TaskStatusRequest request) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        task.setStatus(request.status());
        return ResponseEntity.ok(taskRepository.save(task));
    }
}