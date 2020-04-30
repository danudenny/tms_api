--
-- PostgreSQL database dump
--
CREATE SEQUENCE sms_tracking_message_sms_tracking_message_id_seq;

CREATE TABLE public.sms_tracking_message (
	sms_tracking_message_id int8 DEFAULT nextval('sms_tracking_message_sms_tracking_message_id_seq'::regclass) NOT NULL,
	sent_to int8 NOT NULL,
	is_repeated bool NULL DEFAULT false,
	is_repeated_over bool NULL DEFAULT false,
	note varchar(255) NOT NULL,
	user_id_created int8 NOT NULL,
	created_time timestamp NOT NULL,
	user_id_updated int8 NOT NULL,
	updated_time timestamp NOT NULL,
	is_deleted bool NOT NULL DEFAULT false,
	CONSTRAINT sms_tracking_message_pkey PRIMARY KEY (sms_tracking_message_id)
);