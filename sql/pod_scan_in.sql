-- pod_scan_in
CREATE SEQUENCE public.pod_scan_in_pod_scan_in_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.pod_scan_in
CREATE TABLE public.pod_scan_in
(
    pod_scan_in_id bigint NOT NULL DEFAULT nextval('pod_scan_in_pod_scan_in_id_seq'::regclass),
    awb_id bigint,
    awb_item_id bigint,
    bag_item_id bigint,
    user_id bigint,
    branch_id bigint,
    scan_in_type varchar (50),
    pod_scanin_date_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT pod_scan_in_pkey PRIMARY KEY (pod_scan_in_id)
)
WITH (
    OIDS=FALSE
);


-- ALTER SEQUENCE pod_scan_in_pod_scan_in_id_seq RESTART WITH 1;
-- UPDATE pod_scan_in SET pod_scan_in_id=nextval('pod_scan_in_pod_scan_in_id_seq');
