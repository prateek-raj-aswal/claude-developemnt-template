package com.kanban.service;

import com.kanban.dto.request.UpdateColumnRequest;
import com.kanban.dto.response.ColumnResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.model.BoardMember;
import com.kanban.model.User;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.ColumnRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * US-1806: ColumnService — hex color field PATCH tests.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ColumnColorServiceTest {

    @Autowired ColumnService columnService;
    @Autowired BoardRepository boardRepository;
    @Autowired ColumnRepository columnRepository;
    @Autowired BoardMemberRepository memberRepository;
    @Autowired UserRepository userRepository;

    private UUID createUser() {
        User u = new User();
        u.setEmail("test-" + UUID.randomUUID() + "@test.com");
        u.setPasswordHash("hash");
        u.setDisplayName("Test User");
        return userRepository.save(u).getId();
    }

    private Board createBoard(UUID ownerId) {
        Board b = new Board();
        b.setName("Test Board");
        b.setOwnerId(ownerId);
        b = boardRepository.save(b);
        BoardMember m = new BoardMember();
        m.setBoardId(b.getId());
        m.setUserId(ownerId);
        m.setRole(Role.OWNER);
        memberRepository.save(m);
        return b;
    }

    private BoardColumn createColumn(Board board) {
        BoardColumn col = new BoardColumn();
        col.setBoard(board);
        col.setName("Col");
        col.setPosition(1000);
        return columnRepository.save(col);
    }

    @Test
    void updateColumn_sets_hex_color() {
        UUID userId = createUser();
        Board board = createBoard(userId);
        BoardColumn col = createColumn(board);

        UpdateColumnRequest req = new UpdateColumnRequest(null, null, "#ef4444");
        ColumnResponse resp = columnService.updateColumn(col.getId(), req, userId);

        assertThat(resp.color()).isEqualTo("#ef4444");
        assertThat(resp.headerColor()).isNull();
    }

    @Test
    void updateColumn_clears_hex_color_with_null() {
        UUID userId = createUser();
        Board board = createBoard(userId);
        BoardColumn col = createColumn(board);
        col.setColor("#ef4444");
        columnRepository.save(col);

        UpdateColumnRequest req = new UpdateColumnRequest(null, null, null);
        ColumnResponse resp = columnService.updateColumn(col.getId(), req, userId);

        assertThat(resp.color()).isNull();
    }

    @Test
    void updateColumn_does_not_affect_headerColor() {
        UUID userId = createUser();
        Board board = createBoard(userId);
        BoardColumn col = createColumn(board);
        col.setHeaderColor("blue");
        columnRepository.save(col);

        UpdateColumnRequest req = new UpdateColumnRequest(null, null, "#3b82f6");
        ColumnResponse resp = columnService.updateColumn(col.getId(), req, userId);

        assertThat(resp.color()).isEqualTo("#3b82f6");
        assertThat(resp.headerColor()).isEqualTo("blue");
    }
}
