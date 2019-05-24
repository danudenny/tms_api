-- Seq: partner_logistic 24/05/2019
CREATE SEQUENCE public.partner_logistic_partner_logistic_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;

-- Table: public.partner_logistic 24/05/2019
CREATE TABLE public.partner_logistic
(
    partner_logistic_id bigint NOT NULL DEFAULT nextval('partner_logistic_partner_logistic_id_seq'::regclass),
    partner_logistic_name varchar (500),
    partner_logistic_email varchar (500),
    partner_logistic_notelp varchar (100),
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT partner_logistic_pkey PRIMARY KEY (partner_logistic_id)
)
WITH (
    OIDS=FALSE
);
-- ALTER SEQUENCE partner_logistic_partner_logistic_id_seq RESTART WITH 1;
-- UPDATE pod_scan SET partner_logistic_id=nextval('partner_logistic_partner_logistic_id_seq');