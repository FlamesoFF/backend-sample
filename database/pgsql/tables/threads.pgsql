--TODO: Remove next line
DROP TABLE IF EXISTS threads CASCADE;

CREATE TABLE IF NOT EXISTS threads(
    thread_id TEXT NOT NULL
    ,order_id TEXT NOT NULL REFERENCES orders(order_id)
)
;

CREATE UNIQUE INDEX IF NOT EXISTS ux_threads ON threads(
    thread_id
    ,order_id
)
;