CREATE TABLE IF NOT EXISTS contacts(
	contact_id TEXT NOT NULL
	,entity_id TEXT NOT NULL REFERENCES entities(guid)
    ,message_id TEXT NOT NULL
    ,data JSONB NULL
    ,stamp TIMESTAMP NOT NULL DEFAULT NOW()
	,PRIMARY KEY (
        contact_id
    )
)
;

CREATE INDEX IF NOT EXISTS idx_btree_contacts_quotes ON contacts USING BTREE ((data->>'quotes'));


