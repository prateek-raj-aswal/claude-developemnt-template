package com.kanban.service;

import com.kanban.dto.response.BoardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardMember;
import com.kanban.model.User;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.BoardStarRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * US-1809: BoardStarService — star/unstar/list starred boards.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BoardStarServiceTest {

    @Autowired BoardStarService boardStarService;
    @Autowired BoardService boardService;
    @Autowired BoardRepository boardRepository;
    @Autowired BoardMemberRepository memberRepository;
    @Autowired BoardStarRepository boardStarRepository;
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
        b.setName("Star Test Board");
        b.setOwnerId(ownerId);
        b = boardRepository.save(b);
        BoardMember m = new BoardMember();
        m.setBoardId(b.getId());
        m.setUserId(ownerId);
        m.setRole(Role.OWNER);
        memberRepository.save(m);
        return b;
    }

    @Test
    void star_board_creates_star_record() {
        UUID userId = createUser();
        Board board = createBoard(userId);
        boardStarService.starBoard(board.getId(), userId);
        assertThat(boardStarRepository.existsByUserIdAndBoardId(userId, board.getId())).isTrue();
    }

    @Test
    void star_board_twice_returns_409() {
        UUID userId = createUser();
        Board board = createBoard(userId);
        boardStarService.starBoard(board.getId(), userId);

        assertThatThrownBy(() -> boardStarService.starBoard(board.getId(), userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void unstar_board_removes_star() {
        UUID userId = createUser();
        Board board = createBoard(userId);
        boardStarService.starBoard(board.getId(), userId);
        boardStarService.unstarBoard(board.getId(), userId);
        assertThat(boardStarRepository.existsByUserIdAndBoardId(userId, board.getId())).isFalse();
    }

    @Test
    void get_boards_starred_only_filter() {
        UUID userId = createUser();
        Board b1 = createBoard(userId);
        Board b2 = createBoard(userId);
        boardStarService.starBoard(b1.getId(), userId);

        List<BoardResponse> starred = boardService.getBoardsForUser(userId, true);
        List<BoardResponse> all = boardService.getBoardsForUser(userId, false);

        assertThat(starred).hasSize(1);
        assertThat(starred.get(0).id()).isEqualTo(b1.getId());
        assertThat(starred.get(0).starred()).isTrue();
        assertThat(all).hasSize(2);
    }

    @Test
    void board_response_starred_field_reflects_star_state() {
        UUID userId = createUser();
        Board b1 = createBoard(userId);
        boardStarService.starBoard(b1.getId(), userId);

        List<BoardResponse> all = boardService.getBoardsForUser(userId, false);
        BoardResponse resp = all.stream().filter(r -> r.id().equals(b1.getId())).findFirst().orElseThrow();
        assertThat(resp.starred()).isTrue();
    }
}
