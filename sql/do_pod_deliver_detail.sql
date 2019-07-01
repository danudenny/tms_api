CREATE SEQUENCE public.do_pod_deliver_detail_do_pod_deliver_detail_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

CREATE TABLE public.do_pod_deliver_detail
(
    do_pod_deliver_detail_id bigint NOT NULL DEFAULT nextval('do_pod_deliver_detail_do_pod_deliver_detail_id_seq'::regclass),
    do_pod_deliver_id bigint NOT NULL,
    employee_journey_id_out bigint,
    employee_journey_id_in bigint,
    do_pod_status_id_last bigint,
    awb_item_id bigint,
    longitude_delivery character varying(255),
    latitude_delivery character varying(255),
    description text,
    user_id_created bigint NOT NULL,
    created_time timestamp without time zone NOT NULL,
    user_id_updated bigint NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT do_pod_deliver_detail_pkey PRIMARY KEY (do_pod_deliver_detail_id)
)
WITH (
    OIDS=FALSE
);
