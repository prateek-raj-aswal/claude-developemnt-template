package com.kanban.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response payload returned for board read and mutation operations.
 * {@code columns} is populated only on single-board GET; it is null on list endpoints.
 */
public record BoardResponse(
        UUID id,
        String name,
        UUID ownerId,
        String role,
        Instant createdAt,
        UUID workspaceId,
        int taskCount,
        List<ColumnResponse> columns,
        String description,
        String groupBy,
        boolean starred,
        String emoji
) {}
