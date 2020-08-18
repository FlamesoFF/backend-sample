CREATE TABLE IF NOT EXISTS managers(
	manager_id TEXT NOT NULL REFERENCES persons(person_id)
	,initial TEXT NOT NULL
)
;