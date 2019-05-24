-- pod_scan
CREATE SEQUENCE public.pod_scan_pod_scan_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.pod_scan
CREATE TABLE public.pod_scan
(
    pod_scan_id bigint NOT NULL DEFAULT nextval('pod_scan_pod_scan_id_seq'::regclass),
    do_pod_id bigint,
    awb_id bigint,
    awb_item_id bigint,
    branch_id bigint,
    user_id bigint,
    pod_scanin_date_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT pod_scan_pkey PRIMARY KEY (pod_scan_id)
)
WITH (
    OIDS=FALSE
);


-- ALTER SEQUENCE pod_scan_pod_scan_id_seq RESTART WITH 1;
-- UPDATE pod_scan SET pod_scan_id=nextval('pod_scan_pod_scan_id_seq');
