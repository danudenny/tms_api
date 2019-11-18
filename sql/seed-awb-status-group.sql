--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: awb_status_group; Type: TABLE DATA; Schema: public; Owner: sicepatstaging
--

INSERT INTO public.awb_status_group (awb_status_group_id, code, name, description, user_id_created, created_time, user_id_updated, updated_time, is_deleted) VALUES (1, 'IN', 'IN', NULL, 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false);
INSERT INTO public.awb_status_group (awb_status_group_id, code, name, description, user_id_created, created_time, user_id_updated, updated_time, is_deleted) VALUES (2, 'OUT', 'OUT', NULL, 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false);


--
-- PostgreSQL database dump complete
--

