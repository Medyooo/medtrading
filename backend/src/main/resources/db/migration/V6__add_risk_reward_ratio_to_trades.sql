-- Ratio R/R prévu à l’ouverture (saisi / calculé côté client).
ALTER TABLE trades
    ADD COLUMN risk_reward_ratio NUMERIC(12, 4);
