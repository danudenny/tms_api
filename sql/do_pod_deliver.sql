-- do_pod_deliver
CREATE SEQUENCE public.do_pod_deliver_do_pod_deliver_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.do_pod_deliver
CREATE TABLE public.do_pod_deliver
(
    do_pod_deliver_id bigint NOT NULL DEFAULT nextval('do_pod_deliver_do_pod_deliver_id_seq'::regclass),
    do_pod_deliver_code character varying(255) NOT NULL,
    ref_do_pod_deliver_code character varying(255),
    do_pod_deliver_date_time timestamp without time zone NOT NULL,
    total_assigned int,
    employee_id_driver bigint,
    description text,
    user_id bigint,
    branch_id bigint,
    total_item int NOT NULL Default 0,
    total_pod_item int NOT NULL Default 0,
    total_weight numeric(20,5) NOT NULL Default 0,
    user_id_created bigint,
    created_time timestamp without time zone NOT NULL,
    user_id_updated bigint,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT do_pod_deliver_pkey PRIMARY KEY (do_pod_deliver_id)
)
WITH (
    OIDS=FALSE
);


-- ALTER SEQUENCE do_pod_deliver_do_pod_deliver_id_seq RESTART WITH 1;
-- UPDATE do_pod_deliver SET do_pod_deliver_id=nextval('do_pod_deliver_do_pod_deliver_id_seq');
