-- Seq: awb_item_attr 11/07/2019
CREATE SEQUENCE public.awb_item_attr_awb_item_attr_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.awb_item_attr 11/07/2019
CREATE TABLE public.awb_item_attr
(
    awb_item_attr_id bigint NOT NULL DEFAULT nextval('awb_item_attr_awb_item_attr_id_seq'::regclass),
    awb_attr_id bigint,
    awb_number varchar (100),
    awb_number_pl varchar (100),
    awb_history_id_last bigint,
    awb_status_id_last bigint,
    awb_status_id_last_public bigint,
    user_id_last bigint,
    branch_id_last bigint,
    branch_id_next bigint,
    lead_time_run_days int,
    lead_time_final_days int,
    try_attempt int,
    history_date_last timestamp without time zone NULL,
    final_status_date timestamp without time zone NULL,
    awb_status_id_final bigint,
    uuid varchar (50),
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT awb_item_attr_id_pkey PRIMARY KEY (awb_item_attr_id)
)
WITH (
    OIDS=FALSE
);