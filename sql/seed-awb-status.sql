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
-- Data for Name: awb_status; Type: TABLE DATA; Schema: public; Owner: sicepatstaging
--

INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (1000, 'PIRE', 'PICKUP REQ', 10, 7, 'Pickup Request', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (1200, 'PICK', 'PICK', 10, 7, 'Pick', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (1400, 'UNPI', 'UNPICK', 10, 7, 'Unpick', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (1500, 'IN', 'IN', 10, 7, 'Masuk pertama kali', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (2000, 'ONPR', 'ON PROGRESS', 10, 1, 'On Progress (ketika proses print resi pada kondisi banyak koli)', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (2100, 'AWCR', 'AWB CREATED', 20, 2, 'Ready To Input (ketika Simpan Resi) - MANIFESTED', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (2200, 'ADTA', 'ADMIN TAKEN', 10, 3, 'Proses Edit (take by admin, proses edit)', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (2300, 'AWCO', 'AWB COMPLETED', 20, 4, 'Edit Done (after edit)', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (2400, 'FILT', 'FILTERED', 10, 5, 'Sortir Paket (scan), jika sortir paket dibatalkan -> maka awb_status back to previous', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (2500, 'PACO', 'PACK COMBINED', 10, 6, 'Gabung Paket (pack) - Manifested', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (3000, 'OUT', 'OUT', 10, 7, 'Keluar dari gerai manifested', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (3500, 'IN', 'IN', 10, 7, 'Masuk dari gerai sekota', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (4000, 'BAPA', 'BAGGING PACK', 10, 7, 'Bagging Pack', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (10000, 'SMPA', 'SMU PACK', 10, 8, 'SMU Pack', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (10500, 'SMUN', 'SMU UNPACK', 10, 9, 'SMU Unpack', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (12000, 'BAUN', 'BAGGING UNPACK', 10, 10, 'Bagging Unpack', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (12500, 'UNCO', 'UNPACK COMBINED', 10, 11, 'Gabung Unpack - First Scan In Gerai', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (14000, 'ANT', 'ANTAR', 10, 7, 'Pengantaran oleh Kurir Sicepat', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (30000, 'DLV', 'DELIVERED', 10, 7, 'Terkirim', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, true, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (1800, 'CANCEL', 'CANCEL', 10, 7, 'Cancel, pesanan dibatalkan', 1, '2019-01-11 09:00:00', 1, '2019-01-11 09:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (3005, 'OUT_BRANCH', 'OUT', 10, 7, 'Keluar Ke Gerai', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (3010, 'OUT_HUB', 'OUT', 10, 7, 'Keluar Ke Hub', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (13000, 'IN', 'IN', 10, 7, 'In Last Mile', 1, '2018-07-03 12:00:00', 1, '2018-07-03 12:00:00', false, false, false, false);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (20000, 'CC', 'CRISS CROSS', 10, 7, 'Salah last mile dari sicepat', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (22000, 'BA', 'BAD ADDRESS', 10, 7, 'Alamat tidak dikenal', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, true, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (21500, 'AU', 'ANTAR ULANG', 10, 7, 'Akan dilakukan pengantaran ulang besok', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (22500, 'MR', 'MISROUTE', 10, 7, 'Salah assign kurir dari sicepat', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (23500, 'LOST', 'HILANG', 10, 7, 'Hilang', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, true, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (24000, 'BROKE', 'BROKE', 10, 7, 'Rusak', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, true, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (24500, 'RTN', 'RETUR PUSAT', 10, 7, 'Paket dikembalikan ke pusat', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (25000, 'RTS', 'RETURN TO SHIPPER', 10, 7, 'Paket dikembalikan ke pengirim', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, true, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (25500, 'HOLD', 'HOLD / PENDING', 10, 7, 'Dipending karena request dari pengirim', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (26500, 'CODB', 'CODB', 10, 7, 'COD Bermasalah', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, true, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (27000, 'OTS', 'OTS', 10, 7, 'Akan ditransitkan sesuai jadwal', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (27500, 'OSD', 'OSD', 10, 7, 'Akan dikirim sesuai jadwal dari penerima', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (23000, 'CODA', 'CLOSED ONCE DELIVERY ATTEMPT', 10, 7, 'kantor tutup', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (21000, 'NTH', 'NOT AT HOME', 10, 7, 'Penerima barang tidak dirumah', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, true, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (20500, 'CU', 'CNEE UNKNOWN', 10, 7, 'Penerima barang tidak dikenal', 1, '2018-09-19 12:00:00', 1, '2018-09-19 12:00:00', false, false, true, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (24200, 'RTA', 'RETURN TO AGENT', 10, 7, 'Retur Gerai', 1, '2019-07-15 17:39:00', 1, '2019-07-15 17:39:06', false, false, false, true);
INSERT INTO public.awb_status (awb_status_id, awb_status_name, awb_status_title, awb_visibility, awb_level, awb_desc, user_id_created, created_time, user_id_updated, updated_time, is_deleted, is_final_status, is_attempted, is_problem) VALUES (12800, 'FILT_DIST', 'SORTIR KECAMATAN', 10, 7, 'Sortir Kecamatan', 1, '2019-07-25 12:00:00', 1, '2019-07-25 12:00:00', false, false, false, false);


--
-- PostgreSQL database dump complete
--

