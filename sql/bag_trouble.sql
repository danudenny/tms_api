-- Seq: bag_trouble 02/07/2019
CREATE SEQUENCE public.bag_trouble_bag_trouble_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.bag_trouble 02/07/2019
CREATE TABLE public.bag_trouble
(
    bag_trouble_id bigint NOT NULL DEFAULT nextval('bag_trouble_bag_trouble_id_seq'::regclass),
    bag_status_id bigint,
    bag_number varchar (255),
    resolve_date_time timestamp without time zone NOT NULL,
    status_resolve_id bigint,
    employee_id bigint,
    branch_id bigint,
    description text,
    user_id_created bigint,
    created_time timestamp without time zone NOT NULL,
    user_id_updated bigint,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT bag_trouble_id_pkey PRIMARY KEY (bag_trouble_id)
)
WITH (
    OIDS=FALSE
);