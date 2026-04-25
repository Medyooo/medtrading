

ALTER TABLE pairs
    ADD COLUMN IF NOT EXISTS contract_size NUMERIC NOT NULL DEFAULT 1;

UPDATE pairs
SET contract_size = CASE
    WHEN base_currency = 'XAU' THEN 100
    WHEN base_currency IN ('BTC', 'ETH') THEN 1
    WHEN base_currency IN ('EUR','GBP','USD','AUD','NZD','CAD','CHF','JPY')
         AND quote_currency IN ('USD','JPY','CHF','CAD','AUD','NZD','EUR','GBP') THEN 100000
    ELSE contract_size
END;

