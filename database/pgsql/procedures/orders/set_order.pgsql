DROP PROCEDURE IF EXISTS set_order(TEXT, TEXT, TEXT, TIMESTAMP, JSON, TEXT, TEXT[]);

CREATE OR REPLACE PROCEDURE set_order(
    p_manager_id TEXT
    ,p_client_id TEXT DEFAULT NULL
    ,p_contact_email TEXT DEFAULT NULL
    ,p_order_date DATE DEFAULT NOW()
    ,p_order_data JSON DEFAULT NULL
    ,p_order_id TEXT DEFAULT NULL
    ,p_order_status TEXT DEFAULT NULL
	,p_compliance_status TEXT DEFAULT 'new'
    ,p_accounts_status TEXT DEFAULT 'new'
    ,p_client_status TEXT DEFAULT 'new'
    ,p_tags TEXT[] DEFAULT NULL
    ,p_company_id TEXT DEFAULT NULL
    ,p_client_reference TEXT DEFAULT NULL
	,p_thread_id TEXT[] DEFAULT NULL
)
AS $$
DECLARE
BEGIN

    IF NOT p_client_id IS NULL THEN
        UPDATE orders SET
            client_id = p_client_id
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_contact_email IS NULL THEN
        UPDATE orders SET
            contact_email = p_contact_email
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_order_date IS NULL THEN
        UPDATE orders SET
            order_date = p_order_date
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_order_status IS NULL THEN
        UPDATE orders SET
            order_status = p_order_status
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_compliance_status IS NULL THEN
        UPDATE orders SET
            compliance_status = p_compliance_status
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_accounts_status IS NULL THEN
        UPDATE orders SET
            accounts_status = p_accounts_status
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_tags IS NULL THEN
        UPDATE orders SET
            tags = p_tags
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_company_id IS NULL THEN
        UPDATE orders SET
            company_id = p_company_id
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_client_reference IS NULL THEN
        UPDATE orders SET
            client_reference = p_client_reference
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_order_data IS NULL THEN
        UPDATE orders SET
           data = COALESCE(data || p_order_data::JSONB, p_order_data::JSONB)
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_client_id IS NULL THEN
        UPDATE orders SET
            client_id = p_client_id
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_thread_id IS NULL THEN

        CALL set_threads(
            p_order_id
            ,p_thread_id
            ,TRUE
        ); 
        
    END IF;

EXCEPTION
    WHEN OTHERS THEN

    -- Rethrow exception if needed
    RAISE NOTICE '% %', SQLERRM, SQLSTATE;

END
$$
LANGUAGE plpgsql
;