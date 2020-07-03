--TODO: migrate entities (guid) to entities(entity_id)
--      and modify fuzzy search function

-- Table: public.entities

-- DROP TABLE public.entities;

CREATE TABLE IF NOT EXISTS public.entities
(
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(255) COLLATE pg_catalog."default",
    data jsonb,
    guid character varying(36) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT entities_copy1_pkey1 PRIMARY KEY (guid),
    CONSTRAINT entities_copy1_name_ufields_class_key1 UNIQUE (name, description, data)
)

TABLESPACE pg_default;

ALTER TABLE public.entities
    OWNER to postgres;

GRANT SELECT ON TABLE public.entities TO developer;

GRANT ALL ON TABLE public.entities TO postgres;
-- Index: idx_btree_entities_class

-- DROP INDEX public.idx_btree_entities_class;

CREATE INDEX IF NOT EXISTS idx_btree_entities_class
    ON public.entities USING btree
    ((data ->> 'class'::text) COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_btree_entities_type

-- DROP INDEX public.idx_btree_entities_type;

CREATE INDEX IF NOT EXISTS idx_btree_entities_type
    ON public.entities USING btree
    ((data ->> 'type'::text) COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;