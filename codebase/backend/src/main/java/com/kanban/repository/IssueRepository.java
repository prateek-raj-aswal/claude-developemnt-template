package com.kanban.repository;

import com.kanban.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface IssueRepository extends JpaRepository<Issue, UUID> {

    List<Issue> findByParentCardId(UUID parentCardId);

    @Query("SELECT i FROM Issue i WHERE " +
           "(i.parentCard IS NULL AND i.createdBy.id = :userId) " +
           "OR (i.parentCard IS NOT NULL AND EXISTS (" +
           "  SELECT bm FROM BoardMember bm " +
           "  WHERE bm.boardId = i.parentCard.column.board.id " +
           "  AND bm.userId = :userId))")
    List<Issue> findAccessibleByUser(@Param("userId") UUID userId);
}
