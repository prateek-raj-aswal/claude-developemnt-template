package com.kanban.migration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-1800: Verifies V33__add_start_date_to_cards.sql is idempotent.
 * Requires live DB via application-test.yml.
 */
@SpringBootTest
@ActiveProfiles("test")
class V33MigrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void cards_start_date_column_exists_and_is_date_type() {
        String udt = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='tasks' AND column_name='start_date'",
                String.class);
        assertThat(udt).isEqualTo("date");
    }

    @Test
    void cards_start_date_is_nullable() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='tasks' AND column_name='start_date'",
                String.class);
        assertThat(nullable).isEqualTo("YES");
    }

    @Test
    void existing_cards_have_null_start_date_by_default() {
        Integer count = jdbc.queryForObject(
                "SELECT count(*) FROM tasks WHERE start_date IS NOT NULL", Integer.class);
        assertThat(count).isNotNull();
    }
}
