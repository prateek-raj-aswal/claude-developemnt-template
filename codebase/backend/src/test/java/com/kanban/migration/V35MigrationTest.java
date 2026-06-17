package com.kanban.migration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * US-1806: Verifies V35__add_color_to_columns.sql applied the hex color column.
 * Requires live DB via application-test.yml.
 */
@SpringBootTest
@ActiveProfiles("test")
class V35MigrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void columns_color_column_exists_and_is_varchar() {
        String udt = jdbc.queryForObject(
                "SELECT udt_name FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='columns' AND column_name='color'",
                String.class);
        assertThat(udt).isEqualTo("varchar");
    }

    @Test
    void columns_color_is_nullable() {
        String nullable = jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='columns' AND column_name='color'",
                String.class);
        assertThat(nullable).isEqualTo("YES");
    }

    @Test
    void columns_header_color_still_exists() {
        Integer count = jdbc.queryForObject(
                "SELECT count(*) FROM information_schema.columns " +
                "WHERE table_schema='public' AND table_name='columns' AND column_name='header_color'",
                Integer.class);
        assertThat(count).isEqualTo(1);
    }
}
