--
-- PostgreSQL database dump
--
CREATE SEQUENCE sms_tracking_shift_sms_tracking_shift_id_seq;

CREATE TABLE public.sms_tracking_shift (
	sms_tracking_shift_id int8 DEFAULT nextval('sms_tracking_shift_sms_tracking_shift_id_seq'::regclass) NOT NULL,
	work_from varchar(255) NULL,
	work_to varchar(255) NULL,
	user_id_created int8 NOT NULL,
	created_time timestamp NOT NULL,
	user_id_updated int8 NOT NULL,
	updated_time timestamp NOT NULL,
	is_deleted bool NOT NULL DEFAULT false,
	CONSTRAINT sms_tracking_shift_pkey PRIMARY KEY (sms_tracking_shift_id)
);