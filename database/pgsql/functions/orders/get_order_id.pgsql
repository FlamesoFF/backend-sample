DROP FUNCTION IF EXISTS get_order_id(BIGINT, TEXT);

CREATE OR REPLACE FUNCTION get_order_id(
    p_manager_id TEXT
)
RETURNS TEXT
IMMUTABLE
AS $$
DECLARE v_initials TEXT = 'ZZ';
DECLARE v_prefix TEXT = 'ORD';
DECLARE v_number BIGINT;
BEGIN

    SELECT
        NEXTVAL('order_number_seq') 
    INTO 
        v_number
    ;

    SELECT
        m.initial
    INTO
        v_initials
    FROM
        managers m
    WHERE
        m.manager_id = manager_id
	;

    RETURN FORMAT('%s-%s%s', v_prefix, LPAD(format('%s', v_number), 6, '0'), v_initials);

END;
$$
LANGUAGE plpgsql