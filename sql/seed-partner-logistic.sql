--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: partner_logistic; Type: TABLE DATA; Schema: public; Owner: sicepatstaging
--

INSERT INTO public.partner_logistic (partner_logistic_id, partner_logistic_name, partner_logistic_email, partner_logistic_notelp, is_deleted) VALUES (1, 'Jne Ekspedisi', 'jne@mail.com', '00000', false);
INSERT INTO public.partner_logistic (partner_logistic_id, partner_logistic_name, partner_logistic_email, partner_logistic_notelp, is_deleted) VALUES (2, 'J&T Ekspedisi', 'jnt@mail.com', '00000', false);
INSERT INTO public.partner_logistic (partner_logistic_id, partner_logistic_name, partner_logistic_email, partner_logistic_notelp, is_deleted) VALUES (3, 'Pos Ekspedisi', 'pos@mail.com', '00000', false);
INSERT INTO public.partner_logistic (partner_logistic_id, partner_logistic_name, partner_logistic_email, partner_logistic_notelp, is_deleted) VALUES (4, 'Tiki Ekspedisi', 'tiki@mail.com', '00000', false);
INSERT INTO public.partner_logistic (partner_logistic_id, partner_logistic_name, partner_logistic_email, partner_logistic_notelp, is_deleted) VALUES (5, 'Lion Ekspedisi', 'lion@mail.com', '00000', false);


--
-- PostgreSQL database dump complete
--

