UPDATE trades
SET direction = 'LONG'
WHERE UPPER(direction) IN ('BUY', 'LONG');

UPDATE trades
SET direction = 'SHORT'
WHERE UPPER(direction) IN ('SELL', 'SHORT');
