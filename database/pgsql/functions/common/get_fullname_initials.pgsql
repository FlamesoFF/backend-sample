CREATE OR REPLACE FUNCTION get_fullname_initials(
    fullname TEXT
)
RETURNS TEXT
AS $$
DECLARE v_initials TEXT;
BEGIN

    SELECT
        STRING_AGG(SUBSTR(i.value, 1, 1), '')
    INTO
        v_initials
    FROM (
        SELECT 
            UNNEST(STRING_TO_ARRAY(fullname, ' ')) AS value
    ) i
	;

    RETURN UPPER(v_initials);

END;
$$
LANGUAGE plpgsql