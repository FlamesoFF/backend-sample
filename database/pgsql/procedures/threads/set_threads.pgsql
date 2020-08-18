DROP PROCEDURE IF EXISTS set_threads(TEXT, TEXT[]);

CREATE OR REPLACE PROCEDURE set_threads(
    p_order_id TEXT
    ,p_thread_id TEXT[]
    ,p_explicit BOOLEAN DEFAULT FALSE
)
AS $$
DECLARE
BEGIN

    WITH ids AS (
        SELECT 
            p_order_id AS order_id
            ,UNNEST(p_thread_id) AS thread_id
    )
    INSERT INTO threads(
        order_id
        ,thread_id
    )
    SELECT
        i.order_id
        ,i.thread_id
    FROM
        ids i
    WHERE 
        NOT EXISTS(
            SELECT *
            FROM
                threads t
            WHERE
                t.order_id = i.order_id
                AND t.thread_id = i.thread_id
        )
    ;
	
    IF p_explicit THEN
        DELETE FROM threads
        WHERE
            order_id = p_order_id
            AND NOT (thread_id = ANY(p_thread_id))
        ;
    END IF
    ;

EXCEPTION
    WHEN OTHERS THEN 
 
    -- Rethrow exception if needed
    RAISE NOTICE '% %', SQLERRM, SQLSTATE;

END
$$
LANGUAGE plpgsql
;