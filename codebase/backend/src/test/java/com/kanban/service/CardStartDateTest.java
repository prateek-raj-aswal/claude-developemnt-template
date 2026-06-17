package com.kanban.service;

import com.kanban.dto.request.UpdateCardRequest;
import com.kanban.dto.response.CardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.model.Card;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardModuleRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.ColumnRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.LabelRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.security.BoardAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardStartDateTest {

    @Mock CardRepository cardRepository;
    @Mock ColumnRepository columnRepository;
    @Mock LabelRepository labelRepository;
    @Mock SubtaskRepository subtaskRepository;
    @Mock CommentRepository commentRepository;
    @Mock CardAssigneeRepository cardAssigneeRepository;
    @Mock CardModuleRepository cardModuleRepository;
    @Mock BoardAccessPolicy accessPolicy;
    @Mock EventBroadcastService eventBroadcastService;
    @Mock ActivityLogService activityLogService;
    @Mock NotificationService notificationService;
    @Mock ReadableIdService readableIdService;

    @InjectMocks CardService cardService;

    private UUID userId;
    private UUID boardId;
    private UUID cardId;
    private Card card;

    @BeforeEach
    void setUp() {
        userId  = UUID.randomUUID();
        boardId = UUID.randomUUID();
        cardId  = UUID.randomUUID();

        Board board = new Board();
        setField(board, "id", boardId);

        BoardColumn column = new BoardColumn();
        setField(column, "id", UUID.randomUUID());
        setField(column, "board", board);
        setField(column, "name", "To Do");

        card = new Card();
        setField(card, "id", cardId);
        setField(card, "column", column);
        setField(card, "title", "Test card");
        setField(card, "position", 1000.0);
    }

    // TC-1801-01: valid startDate before dueDate → saved
    @Test
    void updateCard_validStartDate_beforeDueDate_saved() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LocalDate start = LocalDate.of(2026, 7, 1);
        LocalDate due   = LocalDate.of(2026, 7, 15);
        UpdateCardRequest req = new UpdateCardRequest(null, null, start, due, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getStartDate()).isEqualTo(start);
        assertThat(captor.getValue().getDueDate()).isEqualTo(due);
    }

    // TC-1801-02: startDate after dueDate in request → 422
    @Test
    void updateCard_startDateAfterDueDate_inRequest_throws422() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        LocalDate start = LocalDate.of(2026, 7, 20);
        LocalDate due   = LocalDate.of(2026, 7, 15);
        UpdateCardRequest req = new UpdateCardRequest(null, null, start, due, null, null, null, null);

        assertThatThrownBy(() -> cardService.updateCard(cardId, req, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNPROCESSABLE_ENTITY)
                .satisfies(e -> assertThat(((ApiException) e).getCode()).isEqualTo("START_DATE_AFTER_DUE_DATE"));
    }

    // TC-1801-03: startDate after existing card dueDate → 422
    @Test
    void updateCard_startDateAfterExistingCardDueDate_throws422() {
        setField(card, "dueDate", LocalDate.of(2026, 7, 15));
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        LocalDate start = LocalDate.of(2026, 7, 20);
        UpdateCardRequest req = new UpdateCardRequest(null, null, start, null, null, null, null, null);

        assertThatThrownBy(() -> cardService.updateCard(cardId, req, userId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.UNPROCESSABLE_ENTITY)
                .satisfies(e -> assertThat(((ApiException) e).getCode()).isEqualTo("START_DATE_AFTER_DUE_DATE"));
    }

    // TC-1801-04: startDate equal to dueDate → allowed
    @Test
    void updateCard_startDateEqualToDueDate_allowed() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LocalDate sameDay = LocalDate.of(2026, 7, 15);
        UpdateCardRequest req = new UpdateCardRequest(null, null, sameDay, sameDay, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getStartDate()).isEqualTo(sameDay);
    }

    // TC-1801-05: null startDate → cleared
    @Test
    void updateCard_nullStartDate_cleared() {
        setField(card, "startDate", LocalDate.of(2026, 1, 1));
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateCardRequest req = new UpdateCardRequest(null, null, null, null, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getStartDate()).isNull();
    }

    // TC-1801-06: GET returns startDate in response
    @Test
    void getCard_startDateIncludedInResponse() {
        LocalDate start = LocalDate.of(2026, 6, 1);
        setField(card, "startDate", start);
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));

        CardResponse res = cardService.getCard(cardId, userId);

        assertThat(res.startDate()).isEqualTo(start);
    }

    // TC-1801-07: startDate set with null dueDate on card → saved without error
    @Test
    void updateCard_startDateWithNullDueDateOnCard_saved() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LocalDate start = LocalDate.of(2026, 8, 1);
        UpdateCardRequest req = new UpdateCardRequest(null, null, start, null, null, null, null, null);
        cardService.updateCard(cardId, req, userId);

        ArgumentCaptor<Card> captor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository).save(captor.capture());
        assertThat(captor.getValue().getStartDate()).isEqualTo(start);
    }

    @SuppressWarnings("unchecked")
    private static void setField(Object obj, String field, Object value) {
        try {
            var f = findField(obj.getClass(), field);
            f.setAccessible(true);
            f.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static java.lang.reflect.Field findField(Class<?> clazz, String name) throws NoSuchFieldException {
        try { return clazz.getDeclaredField(name); }
        catch (NoSuchFieldException e) {
            if (clazz.getSuperclass() != null) return findField(clazz.getSuperclass(), name);
            throw e;
        }
    }
}
