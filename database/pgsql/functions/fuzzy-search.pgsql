/* 
Based on Andrei Prudnikov's version: https://apollo4u.atlassian.net/browse/API-136
Converted to procedure by Artem Kopchinskiy.
*/

CREATE INDEX IF NOT EXISTS idx_btree_entities_class ON entities USING BTREE ((data->>'class'));
CREATE INDEX IF NOT EXISTS idx_btree_entities_type ON entities USING BTREE ((data->>'type'));

DROP FUNCTION IF EXISTS fuzzy_search_v2(
	TEXT
)
;

DROP FUNCTION IF EXISTS fuzzy_search_v2(
   TEXT,
   JSONB
);

DROP FUNCTION IF EXISTS fuzzy_search_v2(
	TEXT,
	TEXT,
	TEXT
)
;

CREATE OR REPLACE FUNCTION fuzzy_search_v2(
	p_search	TEXT,
	p_json		JSONB
)
RETURNS TABLE (
    id      	VARCHAR,
    name    	VARCHAR,
    class   	TEXT,
    description TEXT,
    similarity 	REAL,
    stddev 		DOUBLE PRECISION,
	percentile	DOUBLE PRECISION
) 
LANGUAGE plpgsql
AS $BODY$
BEGIN
    RETURN QUERY
    WITH
        fuzzy_search AS ( 
            SELECT 
                e.guid AS id
                ,e.name AS name
                ,similarity(e.name, p_search) AS similarity_value
				,e.data->>'class' AS class
                ,ARRAY(SELECT jsonb_array_elements_text(e.data->'type')) AS types
				,e.data->>'type'
                ,e.description::TEXT AS description
            FROM 
                entities e
			WHERE
				e.data @> p_json::jsonb
        ),
        fuzzy_stddev AS ( 
            SELECT 
				fuzzy_search.*,
				COALESCE(STDDEV(similarity_value) OVER (), 1.) AS similarity_value_stddev
            FROM fuzzy_search 
            WHERE similarity_value > 0 
        ),
        fuzzy_percentile AS ( 
            SELECT				
				COALESCE(
					PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY similarity_value_stddev)
					,.0
				) AS similarity_value_percentile
            FROM fuzzy_stddev
            WHERE similarity_value > similarity_value_stddev * 1.5 
        )
    SELECT 
        fuzzy_stddev.id,
        fuzzy_stddev.name, 
        fuzzy_stddev.class,
        fuzzy_stddev.description,
        fuzzy_stddev.similarity_value,
		fuzzy_stddev.similarity_value_stddev,
        fuzzy_percentile.similarity_value_percentile
    FROM 
        fuzzy_stddev, fuzzy_percentile
    WHERE 
        fuzzy_stddev.similarity_value >= fuzzy_percentile.similarity_value_percentile * 2
		; 
END $BODY$
;