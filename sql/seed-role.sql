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
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: sicepatstaging
--

INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (1, NULL, 1, 1, 2, NULL, NULL, 'Superadmin', 1, '2018-07-22 10:00:00', 1, '2018-08-24 14:36:46', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (2, NULL, 1, NULL, NULL, NULL, NULL, 'Marketing', 1, '2018-07-24 20:32:05', 1, '2018-08-24 15:15:33', true, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (3, NULL, 1, NULL, NULL, NULL, NULL, 'IT2', 1, '2018-07-24 20:34:16', 1, '2018-08-24 15:15:16', true, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (7, NULL, 1, NULL, NULL, NULL, NULL, 'Root Cost Control', 1, '2018-08-24 14:35:57', 1, '2018-08-24 14:35:57', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (8, NULL, 1, NULL, NULL, NULL, NULL, 'Root Sales Marketing', 1, '2018-08-24 14:36:03', 1, '2018-08-24 14:36:38', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (9, NULL, 1, NULL, NULL, NULL, NULL, 'Root Business Process', 1, '2018-08-24 14:36:11', 1, '2018-08-24 15:15:40', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (10, NULL, 1, NULL, NULL, NULL, NULL, 'Root HRD', 1, '2018-08-24 14:36:19', 1, '2018-08-24 14:36:30', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (11, NULL, 1, NULL, NULL, NULL, NULL, 'Root IT', 1, '2018-08-29 11:38:25', 1, '2018-08-29 11:38:25', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (12, NULL, 1, NULL, NULL, NULL, NULL, 'Root Collection', 7, '2018-08-31 09:38:05', 7, '2018-08-31 09:38:05', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (13, NULL, 1, NULL, NULL, NULL, NULL, 'Ops - Koordinator Operational', 7, '2018-08-31 09:43:21', 166, '2019-01-21 18:10:17', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (14, NULL, 1, NULL, NULL, NULL, NULL, 'Root Business Analyst', 7, '2018-09-06 13:42:37', 7, '2018-09-06 13:42:37', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (15, NULL, 3, NULL, NULL, NULL, NULL, 'Ops - Sigesit Pick Up', 7, '2018-10-04 16:15:56', 166, '2019-01-21 18:16:48', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (16, NULL, NULL, NULL, NULL, NULL, NULL, 'PIC Admin SMU', 7, '2018-11-30 13:56:44', 7, '2019-02-07 14:43:53', true, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (17, NULL, NULL, NULL, NULL, NULL, NULL, 'PIC PICK UP Bandara', 7, '2018-11-30 13:57:04', 7, '2019-02-07 14:44:07', true, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (23, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Sigesit Antar', 166, '2019-01-17 13:36:24', 166, '2019-01-21 18:16:38', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (24, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Sorter', 166, '2019-01-17 13:36:42', 166, '2019-01-21 18:04:32', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (25, NULL, NULL, NULL, NULL, NULL, NULL, 'PIC Pick Up ', 166, '2019-01-17 13:38:32', 7, '2019-02-07 14:43:40', true, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (26, NULL, NULL, NULL, NULL, NULL, NULL, 'Control Tower', 166, '2019-01-17 17:13:18', 166, '2019-01-17 17:13:18', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (27, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Kepala Sigesit', 166, '2019-01-18 11:54:17', 166, '2019-01-21 18:17:15', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (28, NULL, NULL, NULL, NULL, NULL, NULL, 'Operatinal - Kepala SMU', 166, '2019-01-18 17:31:02', 166, '2019-01-18 17:39:33', true, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (29, NULL, NULL, NULL, NULL, NULL, NULL, 'Operator SMU', 166, '2019-01-18 17:31:07', 166, '2019-01-18 17:34:12', true, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (30, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Bagging', 166, '2019-01-18 17:31:21', 166, '2019-01-21 18:04:17', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (31, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Data Entry', 166, '2019-01-18 17:33:05', 166, '2019-01-21 18:04:25', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (32, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Operator SMU', 166, '2019-01-18 17:33:44', 166, '2019-01-21 18:04:39', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (33, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Kepala SMU', 166, '2019-01-18 17:34:40', 166, '2019-01-21 18:04:46', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (34, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Driver', 7, '2019-01-19 15:55:51', 166, '2019-01-21 18:17:34', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (35, NULL, NULL, NULL, NULL, NULL, NULL, 'Staf Finance', 166, '2019-01-21 09:39:06', 166, '2019-01-21 09:39:21', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (36, NULL, NULL, NULL, NULL, NULL, NULL, 'Staf Accounting', 166, '2019-01-21 09:39:34', 166, '2019-01-21 09:39:34', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (37, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Koordinator Regional', 166, '2019-01-21 18:03:55', 166, '2019-01-21 18:03:55', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (38, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Koordinator Wilayah', 166, '2019-01-21 18:05:18', 166, '2019-01-21 18:05:18', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (39, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Koordinator Cabang', 166, '2019-01-21 18:09:57', 166, '2019-01-21 18:09:57', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (40, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Koordinator Sigesit Antar ', 166, '2019-01-21 18:11:00', 166, '2019-01-21 18:11:00', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (41, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Koordinator Sigesit Pick Up', 166, '2019-01-21 18:11:13', 166, '2019-01-21 18:11:13', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (42, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Sigesit Antar COD ( Cash On Delivery )', 166, '2019-01-21 18:12:00', 166, '2019-01-21 18:12:00', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (43, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Kepala Sorter', 166, '2019-01-21 18:12:18', 166, '2019-01-21 18:12:18', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (44, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Admin Luar Kota', 166, '2019-01-21 18:15:19', 166, '2019-01-21 18:15:19', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (45, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Admin Toko', 166, '2019-01-21 18:15:26', 166, '2019-01-21 18:15:26', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (46, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Customer Service', 166, '2019-01-21 18:15:48', 166, '2019-01-21 18:15:48', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (47, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - CS Mobile ', 166, '2019-01-21 18:15:53', 166, '2019-01-21 18:15:53', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (48, NULL, NULL, NULL, NULL, NULL, NULL, 'Root CT', 7, '2019-01-24 13:20:42', 7, '2019-01-24 13:20:42', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (49, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Admin', 18, '2019-01-29 13:38:35', 18, '2019-01-29 13:38:35', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (50, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Sigesit Transit', 18, '2019-01-29 14:15:08', 18, '2019-01-29 14:15:08', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (51, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Driver Bandara', 18, '2019-02-25 08:13:08', 18, '2019-02-25 08:13:08', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (52, NULL, NULL, NULL, NULL, NULL, NULL, 'CS CKL', 7, '2019-03-06 13:59:07', 7, '2019-03-06 13:59:07', false, NULL);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (53, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Koordinator toko', 4234, '2019-05-15 09:08:41', 4234, '2019-05-15 09:09:07', false, false);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (54, NULL, NULL, NULL, NULL, NULL, NULL, 'Ops - Sales ', 4234, '2019-05-17 10:39:11', 4234, '2019-05-17 10:39:11', false, false);
INSERT INTO public.role (role_id, role_id_parent, branch_id, lft, rgt, depth, priority, role_name, user_id_created, created_time, user_id_updated, updated_time, is_deleted, allow_show_region) VALUES (55, NULL, NULL, NULL, NULL, NULL, NULL, 'OPS - CS SSD', 166, '2019-05-21 15:35:57', 166, '2019-05-21 15:35:57', false, false);


--
-- Name: role_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sicepatstaging
--

SELECT pg_catalog.setval('public.role_role_id_seq', 55, true);


--
-- PostgreSQL database dump complete
--

