-- Seq: awb_trouble 24/05/2019
CREATE SEQUENCE public.awb_trouble_awb_trouble_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.awb_trouble 24/05/2019
CREATE TABLE public.awb_trouble
(
    awb_trouble_id bigint NOT NULL DEFAULT nextval('awb_trouble_awb_trouble_id_seq'::regclass),
    awb_status_id bigint,
    awb_number varchar (255),
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
    CONSTRAINT awb_trouble_id_pkey PRIMARY KEY (awb_trouble_id)
)
WITH (
    OIDS=FALSE
);
-- ALTER SEQUENCE awb_trouble_awb_trouble_id_seq RESTART WITH 1;
-- UPDATE pod_scan SET awb_trouble_id=nextval('awb_trouble_awb_trouble_id_seq');