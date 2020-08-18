DROP FUNCTION IF EXISTS find_orders(
	TEXT
	,TEXT[]
	,TEXT[]
);

CREATE OR REPLACE FUNCTION find_orders(
	p_manager_id TEXT DEFAULT NULL,
	p_status TEXT[] DEFAULT NULL,
	p_thread_id TEXT[] DEFAULT NULL
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
    ,company_id TEXT[]
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

	IF NOT (
		p_thread_id IS NULL
		OR p_manager_id IS NULL
		OR p_status IS NULL
	) THEN
		
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
				WHEN cardinality(t.thread_ids) > 0 THEN t.thread_ids
				ELSE NULL
			END AS thread_ids
		FROM
			orders o
				LEFT JOIN LATERAL (
					SELECT
						ARRAY(SELECT t.thread_id FROM threads t WHERE t.order_id = o.order_id) AS thread_ids
				) t 
					ON true
		WHERE
			o.manager_id = p_manager_id
			AND o.order_status = ANY(p_status)
			AND EXISTS(
				SELECT *
				FROM
					threads t
				WHERE
					t.order_id = o.order_id
					AND t.thread_id = ANY(p_thread_id)
			)
		;

	ELSE

		IF NOT (
			p_manager_id IS NULL
			OR p_status IS NULL
		) THEN

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
					WHEN cardinality(t.thread_ids) > 0 THEN t.thread_ids
					ELSE NULL
				END AS thread_ids
			FROM
				orders o
					LEFT JOIN LATERAL (
						SELECT
							ARRAY(SELECT t.thread_id FROM threads t WHERE t.order_id = o.order_id) AS thread_ids
					) t 
						ON true
			WHERE
				o.manager_id = p_manager_id
				AND o.order_status = ANY(p_status)
			;

		ELSE

			IF NOT (
				p_manager_id IS NULL
				OR p_thread_id IS NULL
			) THEN

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
						WHEN cardinality(t.thread_ids) > 0 THEN t.thread_ids
						ELSE NULL
					END AS thread_ids
				FROM
					orders o
						LEFT JOIN LATERAL (
							SELECT
								ARRAY(SELECT t.thread_id FROM threads t WHERE t.order_id = o.order_id) AS thread_ids
						) t 
							ON true
				WHERE
					o.manager_id = p_manager_id
					AND EXISTS(
						SELECT *
						FROM
							threads t
						WHERE
							t.order_id = o.order_id
							AND t.thread_id = ANY(p_thread_id)
					)
				;

			ELSE

				IF NOT (
					p_status IS NULL
					OR p_thread_id IS NULL
				) THEN

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
							WHEN cardinality(t.thread_ids) > 0 THEN t.thread_ids
							ELSE NULL
						END AS thread_ids
					FROM
						orders o
							LEFT JOIN LATERAL (
								SELECT
									ARRAY(SELECT t.thread_id FROM threads t WHERE t.order_id = o.order_id) AS thread_ids
							) t 
								ON true
					WHERE
						o.order_status = ANY(p_status)
						AND EXISTS(
							SELECT *
							FROM
								threads t
							WHERE
								t.order_id = o.order_id
								AND t.thread_id = ANY(p_thread_id)
						)
					;

				ELSE

					IF NOT (
						p_status IS NULL
					) THEN

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
								WHEN cardinality(t.thread_ids) > 0 THEN t.thread_ids
								ELSE NULL
							END AS thread_ids
						FROM
							orders o
								LEFT JOIN LATERAL (
									SELECT
										ARRAY(SELECT t.thread_id FROM threads t WHERE t.order_id = o.order_id) AS thread_ids
								) t 
									ON true
						WHERE
							o.order_status = ANY(p_status)
						;
						
					ELSE

						IF NOT (
							p_manager_id IS NULL
						) THEN

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
									WHEN cardinality(t.thread_ids) > 0 THEN t.thread_ids
									ELSE NULL
								END AS thread_ids
							FROM
								orders o
									LEFT JOIN LATERAL (
										SELECT
											ARRAY(SELECT t.thread_id FROM threads t WHERE t.order_id = o.order_id) AS thread_ids
									) t 
										ON true
							WHERE
								o.manager_id = p_manager_id
							;
						ELSE
						
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
									WHEN cardinality(t.thread_ids) > 0 THEN t.thread_ids
									ELSE NULL
								END AS thread_ids
							FROM
								orders o
									LEFT JOIN LATERAL (
										SELECT
											ARRAY(SELECT t.thread_id FROM threads t WHERE t.order_id = o.order_id) AS thread_ids
									) t 
										ON true
							WHERE
								EXISTS(
									SELECT *
									FROM
										threads t
									WHERE
										t.order_id = o.order_id
										AND t.thread_id = ANY(p_thread_id)
								)
							;

						END IF;

					END IF;

				END IF;

			END IF;

		END IF;

	END IF;

END $$
LANGUAGE plpgsql
;
