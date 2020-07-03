--TODO: Remove next line in the future
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE IF NOT EXISTS orders(
	order_id TEXT NOT NULL 
    ,manager_id TEXT NOT NULL
    ,order_status TEXT NOT NULL DEFAULT 'creating'
    ,compliance_status TEXT NOT NULL DEFAULT 'new'
    ,accounts_status TEXT NOT NULL DEFAULT 'new'
    ,client_status TEXT NOT NULL DEFAULT 'new'
	,order_date DATE NOT NULL DEFAULT NOW()
    ,tags TEXT[] NULL
    ,company_id TEXT NULL
    ,client_reference TEXT NULL
    ,data JSONB NULL
    ,PRIMARY KEY (order_id)
);

CREATE INDEX IF NOT EXISTS idx_btree_orders_quotes ON orders USING BTREE ((data->>'quotes'));
CREATE INDEX IF NOT EXISTS idx_btree_orders_companies ON orders USING BTREE ((data->>'companies'));
CREATE INDEX IF NOT EXISTS idx_btree_orders_comments ON orders USING BTREE ((data->>'comments'));

GRANT INSERT, SELECT, UPDATE, REFERENCES, TRIGGER ON TABLE public.orders TO developer;