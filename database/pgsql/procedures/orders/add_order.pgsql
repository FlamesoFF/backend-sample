DROP PROCEDURE IF EXISTS add_order(TEXT, TEXT, TEXT, TIMESTAMP, JSON, TEXT, TEXT[]);

CREATE OR REPLACE PROCEDURE add_order(
    p_manager_id TEXT
    ,p_client_id TEXT DEFAULT NULL
    ,p_contact_email TEXT DEFAULT NULL
    ,p_order_date DATE DEFAULT NOW()
    ,p_order_data JSON DEFAULT NULL
    ,p_order_id INOUT TEXT DEFAULT NULL
    ,p_order_status TEXT DEFAULT 'creating'
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
    v_order_id TEXT;
BEGIN

    SELECT 
        get_order_id(
            p_manager_id
        )
    INTO 
        v_order_id;

    INSERT INTO orders(
        order_id
        ,manager_id
        ,order_status
        ,compliance_status
        ,accounts_status
        ,client_status
        ,order_date
        ,tags
        ,company_id
        ,client_reference
        ,data
        ,client_id
    )
    VALUES (
        v_order_id
		,p_manager_id
		,p_order_status
        ,p_compliance_status
        ,p_accounts_status
        ,p_client_status
        ,p_order_date
        ,p_tags
        ,p_company_id
        ,p_client_reference
		,p_order_data
		,p_client_id
    )
    RETURNING
        order_id
    INTO
        p_order_id
    ;

    IF NOT p_thread_id IS NULL THEN

        CALL add_threads(
            p_order_id
            ,p_thread_id
        ); 
        
    END IF;

    p_order_id = v_order_id;

EXCEPTION
    WHEN OTHERS THEN
		p_order_id = NULL;

    -- Rethrow exception if needed
	RAISE NOTICE '% %', SQLERRM, SQLSTATE;

END
$$
LANGUAGE plpgsql
;
