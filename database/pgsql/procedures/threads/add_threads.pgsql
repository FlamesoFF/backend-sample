DROP PROCEDURE IF EXISTS add_threads(TEXT, TEXT[]);

CREATE OR REPLACE PROCEDURE add_threads(
    p_order_id TEXT
    ,p_thread_id TEXT[]
)
AS $$
DECLARE
BEGIN

    CALL set_threads(
        p_order_id
        ,p_thread_id
        ,p_explicit := FALSE
    )
    ;

EXCEPTION
    WHEN OTHERS THEN 
 
    -- Rethrow exception if needed
    RAISE NOTICE '% %', SQLERRM, SQLSTATE;

END
$$
LANGUAGE plpgsql
;