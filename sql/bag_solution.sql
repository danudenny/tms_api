-- Seq: bag_solution 02/07/2019
CREATE SEQUENCE public.bag_solution_bag_solution_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.bag_solution 02/07/2019
CREATE TABLE public.bag_solution
(
    bag_solution_id bigint NOT NULL DEFAULT nextval('bag_solution_bag_solution_id_seq'::regclass),
    bag_item_history_id bigint,
    bag_trouble_id bigint,
    bag_solution_desc text,
    user_id_created bigint,
	created_time timestamp without time zone NOT NULL,
    user_id_updated bigint,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT bag_solution_id_pkey PRIMARY KEY (bag_solution_id)
)
WITH (
    OIDS=FALSE
);