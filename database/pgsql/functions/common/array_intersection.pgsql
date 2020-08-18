DROP FUNCTION IF EXISTS array_intersect(
	anyarray
	, anyarray
);

CREATE FUNCTION array_intersect(anyarray, anyarray)
  RETURNS anyarray
  LANGUAGE sql
as $$
    SELECT ARRAY(
        SELECT UNNEST($1)
        INTERSECT
        SELECT UNNEST($2)
    );
$$;