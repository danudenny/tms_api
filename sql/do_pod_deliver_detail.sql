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
    awb_item_id bigint,
    awb_status_id_last bigint,
    reason_id_last bigint,
    awb_status_date_time_last timestamp without time zone NULL,
    sync_date_time_last timestamp without time zone NULL,
    longitude_delivery_last character varying(255),
    latitude_delivery_last character varying(255),
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

-- -- Reset Seq Id
-- ALTER SEQUENCE do_pod_deliver_detail_do_pod_deliver_detail_id_seq RESTART WITH 1;
-- UPDATE do_pod_deliver_detail SET do_pod_deliver_detail_id=nextval('do_pod_deliver_detail_do_pod_deliver_detail_id_seq');