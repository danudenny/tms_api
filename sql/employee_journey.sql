-- Seq: employee_journey 24/05/2019
CREATE SEQUENCE public.employee_journey_employee_journey_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.employee_journey 24/05/2019
CREATE TABLE public.employee_journey
(
    employee_journey_id bigint NOT NULL DEFAULT nextval('employee_journey_employee_journey_id_seq'::regclass),
    employee_id bigint,
    check_in_date timestamp without time zone NOT NULL,
    check_out_date timestamp without time zone NOT NULL,
    longitude_check_in varchar (100),
    latitude_check_in varchar (100),
	longitude_check_out varchar (100),
    latitude_check_out varchar (100),
    user_id_created bigint,
	created_time timestamp without time zone NOT NULL,
    user_id_updated bigint,
    updated_time timestamp without time zone NOT NULL,
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT employee_journey_id_pkey PRIMARY KEY (employee_journey_id)
)
WITH (
    OIDS=FALSE
);
-- ALTER SEQUENCE employee_journey_employee_journey_id_seq RESTART WITH 1;
-- UPDATE pod_scan SET employee_journey_id=nextval('employee_journey_employee_journey_id_seq');