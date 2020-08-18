DROP FUNCTION IF EXISTS find_orders_2(
	TEXT
	,TEXT[]
	,TEXT[]
);

CREATE OR REPLACE FUNCTION find_orders_2(
	p_manager_id TEXT DEFAULT NULL,
	p_status TEXT[] DEFAULT NULL,
	p_thread_ids TEXT[] DEFAULT NULL
)
RETURNS TABLE (
	order_id TEXT
    ,manager_id TEXT
    ,client_id TEXT
    ,contact_id TEXT
    ,contact_email TEXT
    ,order_status TEXT
    ,compliance_status TEXT
    ,accounts_status TEXT
    ,client_status TEXT
	,order_date DATE
    ,tags TEXT[]
    ,company_id TEXT
    ,client_reference TEXT
    ,data JSONB
    ,stamp TIMESTAMP
	,thread_ids TEXT[]
)
    COST 100
    VOLATILE
    ROWS 100
AS $$
DECLARE
BEGIN

    RETURN QUERY
    SELECT
        o.order_id
        ,o.manager_id
        ,o.client_id
        ,o.contact_id
        ,o.contact_email
        ,o.order_status
        ,o.compliance_status
        ,o.accounts_status
        ,o.client_status
        ,o.order_date
        ,o.tags
        ,o.company_id
        ,o.client_reference
        ,o.data
        ,o.stamp
        ,CASE
            WHEN cardinality(t.thread_ids) > 0
            THEN t.thread_ids
            ELSE NULL
        END AS thread_ids
    FROM
        orders o
            LEFT JOIN LATERAL (
                SELECT
                    ARRAY(
                        SELECT t.thread_id
                        FROM threads t
                        WHERE t.order_id = o.order_id
                    )
                AS thread_ids
            ) t
            ON TRUE
    WHERE
        CASE WHEN p_status IS NOT NULL THEN
            o.order_status = ANY(p_status)
        ELSE
            TRUE
        END

        AND
            CASE WHEN p_thread_ids IS NOT NULL THEN
                array_length(
                    array_intersect(t.thread_ids, p_thread_ids), 1
                ) > 0
            ELSE
                TRUE
            END

        AND
            CASE WHEN p_manager_id IS NOT NULL THEN
                o.manager_id = p_manager_id
            ELSE
                TRUE
            END
    ;

END $$
LANGUAGE plpgsql
;
