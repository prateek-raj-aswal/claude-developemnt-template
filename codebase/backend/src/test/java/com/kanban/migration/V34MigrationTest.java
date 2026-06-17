package com.kanban.migration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-1803: Verifies V34__add_emoji_to_boards.sql correctly adds the emoji column to boards.
 * <p>
 * Schema-level checks (column existence, type, nullability, default, max-length) are performed
 * against information_schema via a live DB (Spring context + JdbcTemplate).
 * SQL content assertions (column constraint definition, undo pattern) are performed by reading
 * the migration file directly — no INSERT required, so FK constraints are never exercised.
 */
@SpringBootTest
@ActiveProfiles("test")
class V34MigrationTest {

    private static final Path MIGRATION_FILE = Path.of(
            System.getProperty("user.dir"),
            "src/main/resources/db/migration/V34__add_emoji_to_boards.sql"
    );

    /** White Diamond character (U+25C7) used as the board emoji default. */
    private static final String WHITE_DIAMOND = "◇";

    @Autowired
    private JdbcTemplate jdbc;

    /** Confirms the emoji column was added to the boards table. */
    @Test
    void boards_emoji_column_exists_and_is_varchar() {
        String udtName = jdbc.queryForObject(
                // Retrieve the underlying data type name for the emoji column
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'emoji'",
                String.class);
        assertThat(udtName).isEqualTo("varchar");
    }

    /** Confirms the column is NOT NULL — back-fill via DEFAULT satisfies this constraint. */
    @Test
    void boards_emoji_column_is_not_nullable() {
        String isNullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'emoji'",
                String.class);
        assertThat(isNullable).isEqualTo("NO");
    }

    /** Confirms max length is 10 (character_maximum_length for VARCHAR(10)). */
    @Test
    void boards_emoji_column_has_max_length_10() {
        Integer maxLength = jdbc.queryForObject(
                "SELECT character_maximum_length FROM information_schema.columns " +
                "WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'emoji'",
                Integer.class);
        assertThat(maxLength).isEqualTo(10);
    }

    /**
     * Confirms the DEFAULT value stored in information_schema contains the White Diamond (U+25C7).
     * PostgreSQL represents defaults as expression strings, e.g. {@code '◇'::character varying}.
     */
    @Test
    void boards_emoji_column_default_contains_white_diamond() {
        String columnDefault = jdbc.queryForObject(
                "SELECT column_default FROM information_schema.columns " +
                "WHERE table_schema = 'public' AND table_name = 'boards' AND column_name = 'emoji'",
                String.class);
        assertThat(columnDefault).contains(WHITE_DIAMOND);
    }

    /**
     * Confirms no existing board row has a NULL emoji value.
     * The NOT NULL DEFAULT back-fills all rows that existed before V34 ran.
     */
    @Test
    void all_existing_boards_have_non_null_emoji() {
        Integer nullEmojiCount = jdbc.queryForObject(
                "SELECT count(*) FROM boards WHERE emoji IS NULL",
                Integer.class);
        assertThat(nullEmojiCount).isZero();
    }

    /** Confirms the migration file exists on disk (Flyway prerequisite). */
    @Test
    void migration_file_exists() {
        assertThat(MIGRATION_FILE).exists();
    }

    /** Confirms the SQL targets the boards table with the emoji column. */
    @Test
    void migration_sql_adds_emoji_to_boards() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();
        assertThat(sql).contains("ALTER TABLE BOARDS");
        assertThat(sql).contains("EMOJI");
    }

    /**
     * Confirms the migration uses NOT NULL with a DEFAULT clause — necessary for the back-fill to
     * succeed without a separate UPDATE statement.
     */
    @Test
    void migration_sql_uses_not_null_with_default() throws IOException {
        String sql = Files.readString(MIGRATION_FILE).toUpperCase();
        assertThat(sql).contains("NOT NULL");
        assertThat(sql).contains("DEFAULT");
    }

    /**
     * Confirms the DOWN (undo) block is documented in the migration file — the project
     * uses commented-out undo blocks rather than separate undo scripts.
     */
    @Test
    void migration_file_documents_undo_as_drop_column() throws IOException {
        String sql = Files.readString(MIGRATION_FILE);
        // The undo is a commented ALTER TABLE boards DROP COLUMN emoji statement
        assertThat(sql).contains("DROP COLUMN");
        assertThat(sql).contains("emoji");
    }
}
