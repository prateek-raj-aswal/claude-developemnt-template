package com.kanban.service;

import com.kanban.dto.request.CreateBoardRequest;
import com.kanban.dto.request.UpdateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardMember;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.BoardStarRepository;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardModuleRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.repository.UserRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * US-1804 — Board emoji: model / CreateBoardRequest / UpdateBoardRequest / BoardResponse
 */
@ExtendWith(MockitoExtension.class)
class BoardEmojiTest {

    @Mock BoardRepository boardRepository;
    @Mock BoardMemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @Mock BoardAccessPolicy accessPolicy;
    @Mock SubtaskRepository subtaskRepository;
    @Mock CommentRepository commentRepository;
    @Mock CardAssigneeRepository cardAssigneeRepository;
    @Mock CardModuleRepository cardModuleRepository;
    @Mock CardRepository cardRepository;
    @Mock WorkspaceMemberRepository workspaceMemberRepository;
    @Mock BoardStarRepository boardStarRepository;

    private BoardService boardService;

    private UUID userId;
    private UUID boardId;
    private Board existingBoard;
    private BoardMember ownerMember;
    private BoardMember adminMember;
    private BoardMember regularMember;

    @BeforeEach
    void setUp() {
        boardService = new BoardService(
                boardRepository, memberRepository, userRepository, accessPolicy,
                subtaskRepository, commentRepository, cardAssigneeRepository,
                cardModuleRepository, cardRepository, workspaceMemberRepository, boardStarRepository);

        userId = UUID.randomUUID();
        boardId = UUID.randomUUID();

        existingBoard = new Board();
        ReflectionTestUtils.setField(existingBoard, "id", boardId);
        existingBoard.setName("My Board");
        existingBoard.setOwnerId(userId);
        existingBoard.setEmoji("◇");

        ownerMember = new BoardMember();
        ownerMember.setBoardId(boardId);
        ownerMember.setUserId(userId);
        ownerMember.setRole(Role.OWNER);

        adminMember = new BoardMember();
        adminMember.setBoardId(boardId);
        adminMember.setUserId(userId);
        adminMember.setRole(Role.ADMIN);

        regularMember = new BoardMember();
        regularMember.setBoardId(boardId);
        regularMember.setUserId(userId);
        regularMember.setRole(Role.MEMBER);
    }

    // --- POST /api/v1/boards emoji tests ---

    @Test
    void createBoard_withEmoji_returnsBoardResponseWithEmoji() {
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            ReflectionTestUtils.setField(b, "id", boardId);
            return b;
        });
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateBoardRequest req = new CreateBoardRequest("My Board", null, null, "★");
        BoardResponse res = boardService.createBoard(req, userId);

        assertThat(res.emoji()).isEqualTo("★");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getEmoji()).isEqualTo("★");
    }

    @Test
    void createBoard_withoutEmoji_defaultsToDefaultEmoji() {
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            ReflectionTestUtils.setField(b, "id", boardId);
            return b;
        });
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateBoardRequest req = new CreateBoardRequest("My Board", null, null, null);
        BoardResponse res = boardService.createBoard(req, userId);

        assertThat(res.emoji()).isEqualTo("◇");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getEmoji()).isEqualTo("◇");
    }

    @Test
    void createBoard_withEmojiTooLong_throws422InvalidEmoji() {
        CreateBoardRequest req = new CreateBoardRequest("My Board", null, null, "12345678901"); // 11 chars

        assertThatThrownBy(() -> boardService.createBoard(req, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
                    assertThat(apiEx.getCode()).isEqualTo("INVALID_EMOJI");
                });

        verify(boardRepository, never()).save(any());
    }

    @Test
    void createBoard_withDescription_returnsBoardResponseWithDescription() {
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            ReflectionTestUtils.setField(b, "id", boardId);
            return b;
        });
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateBoardRequest req = new CreateBoardRequest("My Board", null, "Project board", null);
        BoardResponse res = boardService.createBoard(req, userId);

        assertThat(res.description()).isEqualTo("Project board");
    }

    // --- PUT /api/v1/boards/{id} emoji tests (via updateBoard service method) ---

    @Test
    void updateBoard_withEmojiByOwner_returns200WithUpdatedEmoji() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(existingBoard));
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(ownerMember));

        UpdateBoardRequest req = new UpdateBoardRequest("My Board", null, null, "◆");
        BoardResponse res = boardService.updateBoard(boardId, req, userId);

        assertThat(res.emoji()).isEqualTo("◆");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getEmoji()).isEqualTo("◆");
    }

    @Test
    void updateBoard_byMember_throws403Forbidden() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(existingBoard));
        doThrow(new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied"))
                .when(accessPolicy).assertRole(boardId, userId, Role.ADMIN);

        UpdateBoardRequest req = new UpdateBoardRequest("My Board", null, null, "◆");

        assertThatThrownBy(() -> boardService.updateBoard(boardId, req, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(apiEx.getCode()).isEqualTo("FORBIDDEN");
                });

        verify(boardRepository, never()).save(any());
    }

    @Test
    void updateBoard_onNonExistentBoard_throws404BoardNotFound() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.empty());

        UpdateBoardRequest req = new UpdateBoardRequest("My Board", null, null, "◆");

        assertThatThrownBy(() -> boardService.updateBoard(boardId, req, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(apiEx.getCode()).isEqualTo("BOARD_NOT_FOUND");
                });

        verify(boardRepository, never()).save(any());
    }

    @Test
    void updateBoard_withNullEmoji_preservesExistingEmoji() {
        existingBoard.setEmoji("★");
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(existingBoard));
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(ownerMember));

        // null emoji = no-op, keep existing ★
        UpdateBoardRequest req = new UpdateBoardRequest("My Board", null, null, null);
        BoardResponse res = boardService.updateBoard(boardId, req, userId);

        assertThat(res.emoji()).isEqualTo("★");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getEmoji()).isEqualTo("★");
    }

    // --- GET /api/v1/boards/{id} emoji tests ---

    @Test
    void getBoard_returnsEmojiAndDescriptionInResponse() {
        existingBoard.setEmoji("◆");
        existingBoard.setDescription("A test board");

        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(existingBoard));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(ownerMember));

        BoardResponse res = boardService.getBoardById(boardId, userId);

        assertThat(res.emoji()).isEqualTo("◆");
        assertThat(res.description()).isEqualTo("A test board");
    }

    // --- Board entity default emoji test ---

    @Test
    void boardEntity_hasDefaultEmoji() {
        Board board = new Board();
        assertThat(board.getEmoji()).isEqualTo("◇");
    }
}
