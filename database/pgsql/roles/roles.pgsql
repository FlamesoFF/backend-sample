DO
$do$
    BEGIN
        IF NOT EXISTS(
                SELECT
                FROM pg_catalog.pg_user -- SELECT list can be empty for this
                WHERE usename = 'developer'
            ) THEN
            CREATE USER developer;
        END IF;
    END
$do$;