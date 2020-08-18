CREATE OR REPLACE PROCEDURE set_order(
    p_manager_id TEXT
    ,p_client_id TEXT DEFAULT NULL
    ,p_contact_id TEXT DEFAULT NULL
    ,p_contact_email TEXT DEFAULT NULL
    ,p_order_date DATE DEFAULT NOW()
    ,p_order_data JSON DEFAULT NULL
    ,p_order_id TEXT DEFAULT NULL
    ,p_order_status TEXT DEFAULT NULL
	,p_compliance_status TEXT DEFAULT 'new'
    ,p_accounts_status TEXT DEFAULT 'new'
    ,p_client_status TEXT DEFAULT 'new'
    ,p_tags TEXT[] DEFAULT NULL
    ,p_company_id TEXT[] DEFAULT NULL
    ,p_client_reference TEXT DEFAULT NULL
	,p_thread_id TEXT[] DEFAULT NULL
)
AS $$
DECLARE
BEGIN

    IF NOT p_client_id IS NULL THEN
        UPDATE orders SET
            client_id = p_client_id
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_contact_id IS NULL OR NOT p_contact_email IS NULL THEN

        IF p_contact_id IS NULL THEN
            p_contact_id = p_contact_email;
        END IF;

        UPDATE orders SET
            contact_id = p_contact_id
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_order_date IS NULL THEN
        UPDATE orders SET
            order_date = p_order_date
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_order_status IS NULL THEN
        UPDATE orders SET
            order_status = p_order_status
            ,order_status_changed_on = NOW()
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
            AND COALESCE(order_status, '') <> COALESCE(p_order_status, '')
        ;
    END IF;

    IF NOT p_compliance_status IS NULL THEN
        UPDATE orders SET
            compliance_status = p_compliance_status
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_accounts_status IS NULL THEN
        UPDATE orders SET
            accounts_status = p_accounts_status
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_tags IS NULL THEN
        UPDATE orders SET
            tags = p_tags
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF cardinality(p_company_id) > 0 THEN
        UPDATE orders SET
            company_id = p_company_id
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    ELSE
        UPDATE orders SET
            company_id = NULL
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_client_reference IS NULL THEN
        UPDATE orders SET
            client_reference = p_client_reference
            ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_order_data IS NULL THEN
        UPDATE orders SET
           data = COALESCE(data || p_order_data::JSONB, p_order_data::JSONB)
           ,stamp = NOW()
        WHERE
            order_id = p_order_id
        ;
    END IF;

    IF NOT p_client_id IS NULL THEN
        UPDATE orders SET
            client_id = p_client_id
            ,stamp = NOW()
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