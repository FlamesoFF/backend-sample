INSERT INTO test(_id, name, type, code, initial)
SELECT
    (RANDOM() * 1000000000) :: INT,
    (
        CASE (RANDOM() * 9)::INT
        WHEN 0 THEN 'John Doe'
        WHEN 1 THEN 'Phill Johnson'
        WHEN 2 THEN 'Jeremy Peterson'
        WHEN 3 THEN 'John Anderson'
        WHEN 4 THEN 'Aragorn'
        WHEN 5 THEN 'Legolas'
        WHEN 6 THEN 'Frodo Baggins'
        WHEN 7 THEN 'Luke Skywalker'
        WHEN 8 THEN 'Han Solo'
        WHEN 9 THEN 'Darth Vader'
        END
    ) :: TEXT,
    (
        CASE (RANDOM() * 2)::INT
        WHEN 0 THEN ARRAY['user']
        WHEN 1 THEN ARRAY['developer']
        WHEN 2 THEN ARRAY['manager']
        END
    ) :: TEXT[],
    (
        CASE (RANDOM() * 4)::INT
        WHEN 0 THEN 'j.doe'
        WHEN 1 THEN 'p.johnson'
        WHEN 2 THEN 's.one'
        WHEN 3 THEN 'l.skywalker'
        WHEN 4 THEN 'd.vader'
        END
    ) :: TEXT,
    (
        CASE (RANDOM() * 4)::INT
        WHEN 0 THEN 'jd'
        WHEN 1 THEN 'pj'
        WHEN 2 THEN 'so'
        WHEN 3 THEN 'ls'
        WHEN 4 THEN 'dv'
        END
    ) :: TEXT

FROM GENERATE_SERIES(1, 10000) s(i);

SELECT MAX(_id) from test;