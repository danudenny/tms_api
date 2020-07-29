--
-- PostgreSQL database dump
--

CREATE SEQUENCE sms_tracking_user_sms_tracking_user_id_seq;

CREATE TABLE public.sms_tracking_user (
	sms_tracking_user_id int8 DEFAULT nextval('sms_tracking_user_sms_tracking_user_id_seq'::regclass) NOT NULL,
	sms_tracking_user_name varchar(255) NOT NULL,
	user_id_created int8 NOT NULL,
	created_time timestamp NOT NULL,
	user_id_updated int8 NOT NULL,
	updated_time timestamp NOT NULL,
	is_deleted bool NOT NULL DEFAULT false,
	CONSTRAINT sms_tracking_user_pkey PRIMARY KEY (sms_tracking_user_id)
);