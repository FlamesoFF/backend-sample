DROP FUNCTION IF EXISTS find_orders(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION find_orders(
	p_manager_id TEXT DEFAULT NULL,
	p_status TEXT[] DEFAULT NULL,
	p_thread_id TEXT[] DEFAULT NULL
)
RETURNS SETOF orders
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
			o.*
		FROM
			orders o
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
		LIMIT 100
		;

	ELSE

		IF NOT (
			p_manager_id IS NULL
			OR p_status IS NULL
		) THEN

			RETURN QUERY
			SELECT
				o.*
			FROM
				orders o
			WHERE
				o.manager_id = p_manager_id
				AND o.order_status = ANY(p_status)
			LIMIT 100
			;

		ELSE

			IF NOT (
				p_manager_id IS NULL
				OR p_thread_id IS NULL
			) THEN

				RETURN QUERY
				SELECT
					o.*
				FROM
					orders o
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
				LIMIT 100
				;

			ELSE

				IF NOT (
					p_status IS NULL
					OR p_thread_id IS NULL
				) THEN

					RETURN QUERY
					SELECT
						o.*
					FROM
						orders o
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
					LIMIT 100
					;

				ELSE

					IF NOT (
						p_status IS NULL
					) THEN

						RETURN QUERY
						SELECT
							o.*
						FROM
							orders o
						WHERE
							o.order_status = ANY(p_status)
						LIMIT 100
						;

					ELSE

						IF NOT (
							p_manager_id IS NULL
						) THEN

							RETURN QUERY
							SELECT
								o.*
							FROM
								orders o
							WHERE
								o.manager_id = p_manager_id
							LIMIT 100
							;
						ELSE

							RETURN QUERY
							SELECT
								o.*
							FROM
								orders o
							WHERE
								EXISTS(
									SELECT *
									FROM
										threads t
									WHERE
										t.order_id = o.order_id
										AND t.thread_id = ANY(p_thread_id)
								)
							LIMIT 100
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
