DO $$
BEGIN

    CREATE TABLE IF NOT EXISTS orders(
        order_id TEXT NOT NULL 
        ,manager_id TEXT NOT NULL
        ,client_id TEXT NULL
        ,contact_id TEXT NULL
        ,contact_email TEXT NULL
        ,order_status TEXT NOT NULL DEFAULT 'creating'
        ,compliance_status TEXT NOT NULL DEFAULT 'new'
        ,accounts_status TEXT NOT NULL DEFAULT 'new'
        ,client_status TEXT NOT NULL DEFAULT 'new'
        ,order_date DATE NOT NULL DEFAULT NOW()
        ,tags TEXT[] NULL
        ,company_id TEXT NULL
        ,client_reference TEXT NULL
        ,data JSONB NULL
        ,stamp TIMESTAMP NOT NULL DEFAULT NOW()
        ,PRIMARY KEY (order_id)
    );

    IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='orders' and column_name='order_status_changed_on') THEN
        ALTER TABLE orders ADD order_status_changed_on TIMESTAMP(2) NULL;
    END IF;

    IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='orders' and column_name='compliance_officer_id') THEN
        ALTER TABLE orders ADD compliance_officer_id TEXT NULL;
    END IF;

    CREATE INDEX IF NOT EXISTS idx_btree_orders_quotes ON orders USING BTREE ((data->>'quotes'));
    CREATE INDEX IF NOT EXISTS idx_btree_orders_companies ON orders USING BTREE ((data->>'companies'));
    CREATE INDEX IF NOT EXISTS idx_btree_orders_comments ON orders USING BTREE ((data->>'comments'));

    GRANT INSERT, SELECT, UPDATE, REFERENCES, TRIGGER ON TABLE public.orders TO developer;

END;
$$