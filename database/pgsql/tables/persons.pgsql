CREATE TABLE IF NOT EXISTS persons(
	person_id TEXT NOT NULL
	,name TEXT NOT NULL
    ,data JSONB
    ,PRIMARY KEY (person_id)
)
;