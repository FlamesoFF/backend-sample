DROP PROCEDURE IF EXISTS upd_order(TEXT, TEXT, TEXT, TIMESTAMP, JSON, TEXT, TEXT[]);

CREATE OR REPLACE PROCEDURE upd_order(
    p_manager_id TEXT
    ,p_client_id TEXT DEFAULT NULL
    ,p_contact_email TEXT DEFAULT NULL
    ,p_order_date DATE DEFAULT NOW()
    ,p_order_data JSON DEFAULT NULL
    ,p_order_id INOUT TEXT DEFAULT NULL
    ,p_order_status INOUT TEXT DEFAULT 'creating'
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

    IF EXISTS(
        SELECT *
        FROM
            orders o
        WHERE
            o.order_id = p_order_id
    ) THEN

        CALL set_order(
            p_manager_id
            ,p_client_id
            ,p_contact_email
            ,p_order_date
            ,p_order_data
            ,p_order_id
            ,p_order_status
            ,p_compliance_status
            ,p_accounts_status
            ,p_client_status
            ,p_tags
            ,p_company_id
            ,p_client_reference
            ,p_thread_id
        )
        ;
    
    ELSE

        CALL add_order(
            p_manager_id
            ,p_client_id
            ,p_contact_email
            ,p_order_date
            ,p_order_data
            ,p_order_id
            ,p_order_status
            ,p_compliance_status
            ,p_accounts_status
            ,p_client_status
            ,p_tags
            ,p_company_id
            ,p_client_reference
            ,p_thread_id
        )
        ;

    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        
    -- Rethrow exception if needed
    RAISE NOTICE '% %', SQLERRM, SQLSTATE;

END
$$
LANGUAGE plpgsql
;