package com.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for PUT /api/v1/boards/{boardId}.
 * All fields are optional patches. A null value means "leave unchanged" except
 * for {@code description} which explicitly clears when null.
 */
public record UpdateBoardRequest(
        @NotBlank @Size(min = 1, max = 255) String name,
        @Size(max = 2000) String description,
        String groupBy,
        @Size(max = 10) String emoji
) {}
