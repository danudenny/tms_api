-- Seq: do_pod_deliver_history 11/07/2019
CREATE SEQUENCE public.do_pod_deliver_history_do_pod_deliver_history_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

-- Table: public.do_pod_deliver_history 11/07/2019
CREATE TABLE public.do_pod_deliver_history
(
    do_pod_deliver_history_id bigint NOT NULL DEFAULT nextval('do_pod_deliver_history_do_pod_deliver_history_id_seq'::regclass),
    do_pod_deliver_detail_id bigint NOT NULL,
    awb_status_id bigint,
    reason_id bigint,
    awb_status_date_time timestamp without time zone NULL,
    sync_date_time timestamp without time zone NULL,
    longitude_delivery character varying(255),
    latitude_delivery character varying(255),
    description text,
    user_id_created bigint NOT NULL,
    created_time timestamp without time zone NOT NULL,
    user_id_updated bigint NOT NULL,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT do_pod_deliver_history_pkey PRIMARY KEY (do_pod_deliver_history_id)
)
WITH (
    OIDS=FALSE
);
