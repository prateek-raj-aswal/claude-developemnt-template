package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/**
 * Request body for POST /api/v1/boards.
 * All fields except {@code name} are optional. When {@code emoji} is omitted or blank
 * the service defaults it to '◇'.
 */
public record CreateBoardRequest(
        @NotBlank @Size(min = 1, max = 255) String name,
        UUID workspaceId,
        @Size(max = 2000) String description,
        @Size(max = 10) String emoji,
        @Size(max = 20) String color
) {}
