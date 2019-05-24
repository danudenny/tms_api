-- Seq: awb_solution 24/05/2019
CREATE SEQUENCE public.awb_solution_awb_solution_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.awb_solution 24/05/2019
CREATE TABLE public.awb_solution
(
    awb_solution_id bigint NOT NULL DEFAULT nextval('awb_solution_awb_solution_id_seq'::regclass),
    awb_history_id bigint,
    awb_trouble_id bigint,
    awb_solution_desc varchar (500),
    user_id_created bigint,
	created_time timestamp without time zone NOT NULL,
    user_id_updated bigint,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT awb_solution_id_pkey PRIMARY KEY (awb_solution_id)
)
WITH (
    OIDS=FALSE
);
-- ALTER SEQUENCE awb_solution_awb_solution_id_seq RESTART WITH 1;
-- UPDATE pod_scan SET awb_trouble_id=nextval('awb_solution_awb_solution_id_seq');