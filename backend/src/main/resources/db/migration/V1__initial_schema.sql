CREATE TABLE users (
                       id          BIGSERIAL PRIMARY KEY,
                       username    VARCHAR(50) NOT NULL UNIQUE,
                       email       VARCHAR(255) NOT NULL UNIQUE,
                       password    VARCHAR(255) NOT NULL,
                       role        VARCHAR(20) NOT NULL DEFAULT 'USER'
);

CREATE TABLE pairs (
                       id              BIGSERIAL PRIMARY KEY,
                       symbol          VARCHAR(20) NOT NULL UNIQUE,
                       name            VARCHAR(100) NOT NULL,
                       base_currency   VARCHAR(10),
                       quote_currency  VARCHAR(10)
);

CREATE TABLE trades (
                        id              BIGSERIAL PRIMARY KEY,
                        user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        pair_id         BIGINT NOT NULL REFERENCES pairs(id),
                        direction       VARCHAR(10) NOT NULL,
                        entry_price     NUMERIC NOT NULL,
                        exit_price      NUMERIC,
                        stop_loss       NUMERIC,
                        take_profit     NUMERIC,
                        lot_size        NUMERIC NOT NULL,
                        profit_loss     NUMERIC,
                        opened_at       TIMESTAMP NOT NULL,
                        closed_at       TIMESTAMP,
                        status          VARCHAR(10) NOT NULL DEFAULT 'OPEN',
                        strategy        VARCHAR(50),
                        timeframe       VARCHAR(20),
                        notes           TEXT
);

CREATE INDEX idx_trade_user ON trades(user_id);
CREATE INDEX idx_trade_pair ON trades(pair_id);