DROP VIEW active_orders;

CREATE VIEW active_orders
AS

SELECT
    o.order_id
    ,o.manager_id
    ,o.client_id
    ,o.contact_id
    ,o.order_status
    ,o.compliance_status
    ,o.accounts_status
    ,o.client_status
	,o.order_date
    ,ARRAY_TO_STRING(o.tags, ',', '') AS description
    ,c.companies
    ,client_reference
	,ROW_NUMBER() OVER(
        ORDER BY
            /* TRIM (
                LEADING '0'
                FROM
                    regexp_replace(o.order_id, '[^0-9]+', '', 'g') 
            )::INT
            ,*/
            order_status_changed_on DESC
    ) AS processing_sequence
FROM
    orders o
        LEFT JOIN LATERAL (
            SELECT
                STRING_AGG(COALESCE(e.name, cid::TEXT), ',') AS companies
            FROM
                UNNEST(o.company_id) cid
                    LEFT JOIN entities e
                        ON e.guid = cid
        ) c ON TRUE
WHERE
    o.order_status NOT IN ('done', 'cancelled')
;

GRANT SELECT, REFERENCES ON TABLE public.active_orders TO developer;