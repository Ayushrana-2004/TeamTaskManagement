package com.app.taskmanager.controller;

import java.util.HashSet;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.taskmanager.dto.DTOs.TaskRequest;
import com.app.taskmanager.dto.DTOs.TaskStatusRequest;
import com.app.taskmanager.model.Project;
import com.app.taskmanager.model.Task;
import com.app.taskmanager.model.TaskStatus;
import com.app.taskmanager.model.User;
import com.app.taskmanager.repository.ProjectRepository;
import com.app.taskmanager.repository.TaskRepository;
import com.app.taskmanager.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<Task>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskRepository.findByProjectId(projectId));
    }

    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@PathVariable Long projectId, @RequestBody TaskRequest request) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        List<User> assignees = userRepository.findAllById(request.assigneeIds());

        // Auto-add assignees to project members
        project.getMembers().addAll(assignees);
        projectRepository.save(project);

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(TaskStatus.TODO);
        task.setProject(project);
        task.setAssignees(new HashSet<>(assignees));

        return ResponseEntity.ok(taskRepository.save(task));
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestBody TaskStatusRequest request) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        task.setStatus(request.status());
        return ResponseEntity.ok(taskRepository.save(task));
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        taskRepository.deleteById(taskId);
        return ResponseEntity.ok("Task deleted");
    }
}
