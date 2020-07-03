--
--CREATE TABLE orders(
--	uuid UUID NOT NULL
--	,number TEXT NOT NULL
--	,name TEXT NOT NULL
--	,type TEXT NOT NULL
--	,order_date timestamp NOT NULL
--	,statuses JSONB NOT NULL
--)
--
--insert into orders(uuid, number,name,type,order_date,statuses)
--values
--(uuid_generate_v4(),'1','first','type',now(),'{
--  "account": "waiting",
--  "compliance": "waiting",
--  "client": "new",
--  "order": "creating"
--}')
--
--select * from find_orders('first')
--select * from find_orders('first','{"client": "new"}')


-- FUNCTION: public.find_orders(text, json)

-- DROP FUNCTION public.find_orders(text, json);

CREATE OR REPLACE FUNCTION public.find_orders_fuzzy(
	p_search text,
	p_json json DEFAULT NULL
)
RETURNS TABLE(
	uuid UUID
	,number TEXT
	,name TEXT
	,type TEXT
	,order_date timestamp
	,statuses JSONB
	,similarity real
	,stddev double precision
	,percentile double precision
)
LANGUAGE 'plpgsql'
COST 100
VOLATILE 
ROWS 1000    
AS $BODY$
DECLARE 
	v_default_percentile float = 0.95;
	v_default_similarity float = 1.;
	v_stddev_multiplier float = 1.5;
	v_similarity_multipler float = 2.0;
BEGIN
	IF p_json IS NOT NULL THEN
		RETURN QUERY
		WITH
			fuzzy_search AS ( 
				SELECT 
					o.uuid AS uuid
					,o.number AS number
					,o.name AS name
					,o.type AS type
					,o.order_date
					,o.statuses AS statuses
					,similarity(o.name, p_search) AS similarity_value
				FROM 
					orders o
				WHERE
					o.statuses @> p_json::jsonb
			),
			fuzzy_stddev AS ( 
				SELECT 
					fuzzy_search.*,
					COALESCE(STDDEV(similarity_value) OVER (), v_default_similarity) AS similarity_value_stddev
				FROM fuzzy_search 
				WHERE similarity_value > 0 
			),
			fuzzy_percentile AS ( 
				SELECT				
					COALESCE(
						PERCENTILE_CONT(v_default_percentile) WITHIN GROUP (ORDER BY similarity_value_stddev)
						,.0
					) AS similarity_value_percentile
				FROM fuzzy_stddev
				WHERE similarity_value > similarity_value_stddev * v_stddev_multiplier
			)
		SELECT 
			fuzzy_stddev.uuid,
			fuzzy_stddev.number, 
			fuzzy_stddev.name, 
			fuzzy_stddev.type,
			fuzzy_stddev.order_date,
			fuzzy_stddev.statuses,
			fuzzy_stddev.similarity_value,
			fuzzy_stddev.similarity_value_stddev,
			fuzzy_percentile.similarity_value_percentile
		FROM 
			fuzzy_stddev, fuzzy_percentile
		WHERE 
			fuzzy_stddev.similarity_value >= fuzzy_percentile.similarity_value_percentile * v_similarity_multipler
			;
	ELSE
		RETURN QUERY
		WITH
			fuzzy_search AS ( 
				SELECT 
					o.uuid AS uuid
					,o.number AS number
					,o.name AS name
					,o.type AS type
					,o.order_date
					,o.statuses AS statuses
					,similarity(o.name, p_search) AS similarity_value
				FROM 
					orders o
			),
			fuzzy_stddev AS ( 
				SELECT 
					fuzzy_search.*,
					COALESCE(STDDEV(similarity_value) OVER (), v_default_similarity) AS similarity_value_stddev
				FROM fuzzy_search 
				WHERE similarity_value > 0 
			),
			fuzzy_percentile AS ( 
				SELECT				
					COALESCE(
						PERCENTILE_CONT(v_default_percentile) WITHIN GROUP (ORDER BY similarity_value_stddev)
						,.0
					) AS similarity_value_percentile
				FROM fuzzy_stddev
				WHERE similarity_value > similarity_value_stddev * v_stddev_multiplier 
			)
		SELECT 
			fuzzy_stddev.uuid,
			fuzzy_stddev.number, 
			fuzzy_stddev.name, 
			fuzzy_stddev.type,
			fuzzy_stddev.order_date,
			fuzzy_stddev.statuses,
			fuzzy_stddev.similarity_value,
			fuzzy_stddev.similarity_value_stddev,
			fuzzy_percentile.similarity_value_percentile
		FROM 
			fuzzy_stddev, fuzzy_percentile
		WHERE 
			fuzzy_stddev.similarity_value >= fuzzy_percentile.similarity_value_percentile * v_similarity_multipler
			;
	END IF;
END $BODY$;

ALTER FUNCTION public.find_orders_fuzzy(text, json)
    OWNER TO postgres;
