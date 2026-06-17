package com.kanban.service;

import com.kanban.dto.request.CreateIssueRequest;
import com.kanban.dto.request.UpdateIssueRequest;
import com.kanban.dto.response.IssueResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Card;
import com.kanban.model.Issue;
import com.kanban.model.User;
import com.kanban.repository.CardRepository;
import com.kanban.repository.IssueRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.BoardAction;
import com.kanban.security.WorkspaceAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class IssueService {

    private static final Set<String> VALID_STATUSES = Set.of("OPEN", "IN_PROGRESS", "CLOSED");
    private static final Set<String> VALID_TYPES   = Set.of("STORY", "FEATURE", "BUG");

    private final IssueRepository issueRepository;
    private final CardRepository  cardRepository;
    private final UserRepository  userRepository;
    private final ReadableIdService readableIdService;
    private final BoardAccessPolicy boardAccessPolicy;
    private final WorkspaceAccessPolicy workspaceAccessPolicy;

    public IssueService(IssueRepository issueRepository,
                        CardRepository cardRepository,
                        UserRepository userRepository,
                        ReadableIdService readableIdService,
                        BoardAccessPolicy boardAccessPolicy,
                        WorkspaceAccessPolicy workspaceAccessPolicy) {
        this.issueRepository = issueRepository;
        this.cardRepository  = cardRepository;
        this.userRepository  = userRepository;
        this.readableIdService = readableIdService;
        this.boardAccessPolicy = boardAccessPolicy;
        this.workspaceAccessPolicy = workspaceAccessPolicy;
    }

    @Transactional
    public IssueResponse createIssue(CreateIssueRequest request, UUID requestingUserId) {
        User creator = userRepository.findById(requestingUserId)
                .orElse(null);

        Card parentCard = null;
        if (request.parentCardId() != null) {
            parentCard = cardRepository.findActiveById(request.parentCardId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND",
                            "Parent card not found"));
        }

        String issueType = request.type() != null ? request.type() : "BUG";
        if (!VALID_TYPES.contains(issueType)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_TYPE",
                    "type must be one of: STORY, FEATURE, BUG");
        }

        UUID workspaceId;
        if (parentCard != null) {
            workspaceId = parentCard.getColumn().getBoard().getWorkspaceId();
        } else {
            workspaceId = request.workspaceId();
            if (workspaceId == null) {
                throw new IllegalArgumentException("workspaceId is required for standalone issues");
            }
            workspaceAccessPolicy.assertMember(workspaceId, requestingUserId);
        }

        Issue issue = new Issue();
        issue.setTitle(request.title());
        issue.setDescription(request.description());
        issue.setStatus("OPEN");
        issue.setType(issueType);
        issue.setReadableId(readableIdService.allocate(workspaceId, issueType));
        issue.setParentCard(parentCard);
        issue.setCreatedBy(creator);

        issue = issueRepository.save(issue);
        return toResponse(issue);
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> listIssues(Optional<UUID> parentCardId, UUID userId) {
        if (parentCardId.isPresent()) {
            Card card = cardRepository.findActiveById(parentCardId.get())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
            boardAccessPolicy.assertAccess(card.getColumn().getBoard().getId(), userId, BoardAction.READ);
            return issueRepository.findByParentCardId(parentCardId.get()).stream().map(this::toResponse).toList();
        }
        return issueRepository.findAccessibleByUser(userId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssue(UUID issueId, UUID userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ISSUE_NOT_FOUND", "Issue not found"));
        assertIssueReadAccess(issue, userId);
        return toResponse(issue);
    }

    @Transactional
    public IssueResponse updateIssue(UUID issueId, UpdateIssueRequest request, UUID userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ISSUE_NOT_FOUND", "Issue not found"));
        assertIssueWriteAccess(issue, userId);

        if (request.title() != null && !request.title().isBlank()) {
            issue.setTitle(request.title());
        }
        issue.setDescription(request.description());

        if (request.status() != null) {
            if (!VALID_STATUSES.contains(request.status())) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS",
                        "Status must be one of: OPEN, IN_PROGRESS, CLOSED");
            }
            issue.setStatus(request.status());
        }

        // parentCardId: null means detach, UUID means attach
        // We apply parentCardId unconditionally so that PATCH {"parentCardId":null} detaches.
        if (request.parentCardId() != null) {
            Card parentCard = cardRepository.findActiveById(request.parentCardId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND",
                            "Parent card not found"));
            issue.setParentCard(parentCard);
        } else {
            issue.setParentCard(null);
        }

        issue = issueRepository.save(issue);
        return toResponse(issue);
    }

    @Transactional
    public void deleteIssue(UUID issueId, UUID userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ISSUE_NOT_FOUND", "Issue not found"));
        assertIssueWriteAccess(issue, userId);
        issueRepository.delete(issue);
    }

    private void assertIssueReadAccess(Issue issue, UUID userId) {
        if (issue.getParentCard() != null) {
            boardAccessPolicy.assertAccess(
                    issue.getParentCard().getColumn().getBoard().getId(), userId, BoardAction.READ);
        } else if (issue.getCreatedBy() == null || !issue.getCreatedBy().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
        }
    }

    private void assertIssueWriteAccess(Issue issue, UUID userId) {
        if (issue.getParentCard() != null) {
            boardAccessPolicy.assertAccess(
                    issue.getParentCard().getColumn().getBoard().getId(), userId, BoardAction.WRITE);
        } else if (issue.getCreatedBy() == null || !issue.getCreatedBy().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
        }
    }

    private IssueResponse toResponse(Issue issue) {
        UUID parentCardId = issue.getParentCard() != null ? issue.getParentCard().getId() : null;
        UUID createdById  = issue.getCreatedBy()  != null ? issue.getCreatedBy().getId()  : null;
        return new IssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus(),
                parentCardId,
                createdById,
                issue.getCreatedAt(),
                issue.getUpdatedAt(),
                issue.getType(),
                issue.getReadableId()
        );
    }
}
