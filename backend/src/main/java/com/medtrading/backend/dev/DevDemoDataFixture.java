package com.medtrading.backend.dev;

import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@Profile("dev")
@ConditionalOnProperty(name = "medtrading.dev-demo.enabled", havingValue = "true", matchIfMissing = true)
public class DevDemoDataFixture implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDemoDataFixture.class);

    private static final String EMAIL_PLACEHOLDER = "__DEV_DEMO_EMAIL__";

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;
    private final String demoEmail;
    private final String demoUsername;
    private final String demoPlainPassword;

    public DevDemoDataFixture(
            JdbcTemplate jdbcTemplate,
            DataSource dataSource,
            PasswordEncoder passwordEncoder,
            @Value("${medtrading.dev-demo.email:}") String demoEmail,
            @Value("${medtrading.dev-demo.username:}") String demoUsername,
            @Value("${medtrading.dev-demo.password:}") String demoPlainPassword) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
        this.demoEmail = demoEmail;
        this.demoUsername = demoUsername;
        this.demoPlainPassword = demoPlainPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (demoEmail.isBlank() || demoUsername.isBlank() || demoPlainPassword.isBlank()) {
            log.warn(
                    "Fixture dev ignorée : medtrading.dev-demo.email, .username et .password sont vides. "
                            + "Définissez-les (ex. variables MEDTRADING_DEV_DEMO_EMAIL, "
                            + "MEDTRADING_DEV_DEMO_USERNAME, MEDTRADING_DEV_DEMO_PASSWORD).");
            return;
        }

        String hash = passwordEncoder.encode(demoPlainPassword);
        jdbcTemplate.update(
                """
                        INSERT INTO users (username, email, password, role)
                        VALUES (?, ?, ?, 'USER')
                        ON CONFLICT (email) DO UPDATE
                        SET username = EXCLUDED.username,
                            password = EXCLUDED.password,
                            role = EXCLUDED.role
                        """,
                demoUsername,
                demoEmail,
                hash);

        String template;
        try {
            template = new String(
                    new ClassPathResource("db/dev/seed_demo_trades.sql").getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de lire db/dev/seed_demo_trades.sql", e);
        }

        String emailSqlLiteral = demoEmail.replace("'", "''");
        String sql = template.replace(EMAIL_PLACEHOLDER, emailSqlLiteral);

        var populator = new ResourceDatabasePopulator();
        populator.addScript(new ByteArrayResource(sql.getBytes(StandardCharsets.UTF_8)));
        populator.setSeparator(";");
        populator.execute(dataSource);

        log.info("Fixture dev : compte démo prêt (email={}, username={}).", demoEmail, demoUsername);
    }
}
