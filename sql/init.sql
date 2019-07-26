/*
 Navicat Premium Data Transfer

 Source Server         : sicepat-tms-masterdata-staging
 Source Server Type    : PostgreSQL
 Source Server Version : 100006
 Source Host           : sicepat-tms-masterdata-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com:5432
 Source Catalog        : sicepattmsstaging2
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 100006
 File Encoding         : 65001

 Date: 14/07/2019 12:05:21
*/


-- ----------------------------
-- Sequence structure for airline_airline_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."airline_airline_id_seq";
CREATE SEQUENCE "public"."airline_airline_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."airline_airline_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for airport_airport_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."airport_airport_id_seq";
CREATE SEQUENCE "public"."airport_airport_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."airport_airport_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for attachment_attachment_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."attachment_attachment_id_seq";
CREATE SEQUENCE "public"."attachment_attachment_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."attachment_attachment_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for attachment_tms_attachment_tms_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."attachment_tms_attachment_tms_id_seq";
CREATE SEQUENCE "public"."attachment_tms_attachment_tms_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."attachment_tms_attachment_tms_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_attr_awb_attr_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_attr_awb_attr_id_seq";
CREATE SEQUENCE "public"."awb_attr_awb_attr_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_attr_awb_attr_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_awb_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_awb_id_seq";
CREATE SEQUENCE "public"."awb_awb_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_awb_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_booking_awb_booking_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_booking_awb_booking_id_seq";
CREATE SEQUENCE "public"."awb_booking_awb_booking_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_booking_awb_booking_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_booking_status_awb_booking_status_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_booking_status_awb_booking_status_id_seq";
CREATE SEQUENCE "public"."awb_booking_status_awb_booking_status_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_booking_status_awb_booking_status_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_detail_awb_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_detail_awb_detail_id_seq";
CREATE SEQUENCE "public"."awb_detail_awb_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_detail_awb_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_history_awb_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_history_awb_history_id_seq";
CREATE SEQUENCE "public"."awb_history_awb_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_history_awb_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_invalid_awb_invalid_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_invalid_awb_invalid_id_seq";
CREATE SEQUENCE "public"."awb_invalid_awb_invalid_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_invalid_awb_invalid_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_item_attr_awb_item_attr_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_item_attr_awb_item_attr_id_seq";
CREATE SEQUENCE "public"."awb_item_attr_awb_item_attr_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_item_attr_awb_item_attr_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_item_awb_item_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_item_awb_item_id_seq";
CREATE SEQUENCE "public"."awb_item_awb_item_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_item_awb_item_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_item_summary_awb_item_summary_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_item_summary_awb_item_summary_id_seq";
CREATE SEQUENCE "public"."awb_item_summary_awb_item_summary_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_item_summary_awb_item_summary_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_price_awb_price_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_price_awb_price_id_seq";
CREATE SEQUENCE "public"."awb_price_awb_price_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_price_awb_price_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_price_item_awb_price_item_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_price_item_awb_price_item_id_seq";
CREATE SEQUENCE "public"."awb_price_item_awb_price_item_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_price_item_awb_price_item_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_request_awb_request_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_request_awb_request_id_seq";
CREATE SEQUENCE "public"."awb_request_awb_request_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_request_awb_request_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_solution_awb_solution_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_solution_awb_solution_id_seq";
CREATE SEQUENCE "public"."awb_solution_awb_solution_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_solution_awb_solution_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_status_awb_status_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_status_awb_status_id_seq";
CREATE SEQUENCE "public"."awb_status_awb_status_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_status_awb_status_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_status_group_awb_status_group_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_status_group_awb_status_group_id_seq";
CREATE SEQUENCE "public"."awb_status_group_awb_status_group_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_status_group_awb_status_group_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_status_group_item_awb_status_group_item_id
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_status_group_item_awb_status_group_item_id";
CREATE SEQUENCE "public"."awb_status_group_item_awb_status_group_item_id" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_status_group_item_awb_status_group_item_id" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_track_awb_track_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_track_awb_track_id_seq";
CREATE SEQUENCE "public"."awb_track_awb_track_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_track_awb_track_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for awb_trouble_awb_trouble_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."awb_trouble_awb_trouble_id_seq";
CREATE SEQUENCE "public"."awb_trouble_awb_trouble_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."awb_trouble_awb_trouble_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bag_bag_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bag_bag_id_seq";
CREATE SEQUENCE "public"."bag_bag_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bag_bag_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bag_item_awb_bag_item_awb_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bag_item_awb_bag_item_awb_id_seq";
CREATE SEQUENCE "public"."bag_item_awb_bag_item_awb_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bag_item_awb_bag_item_awb_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bag_item_bag_item_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bag_item_bag_item_id_seq";
CREATE SEQUENCE "public"."bag_item_bag_item_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bag_item_bag_item_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bag_item_history_bag_item_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bag_item_history_bag_item_history_id_seq";
CREATE SEQUENCE "public"."bag_item_history_bag_item_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bag_item_history_bag_item_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bag_item_status_bag_item_status_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bag_item_status_bag_item_status_id_seq";
CREATE SEQUENCE "public"."bag_item_status_bag_item_status_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bag_item_status_bag_item_status_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bag_solution_bag_solution_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bag_solution_bag_solution_id_seq";
CREATE SEQUENCE "public"."bag_solution_bag_solution_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bag_solution_bag_solution_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bag_trouble_bag_trouble_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bag_trouble_bag_trouble_id_seq";
CREATE SEQUENCE "public"."bag_trouble_bag_trouble_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bag_trouble_bag_trouble_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bagging_bagging_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bagging_bagging_id_seq";
CREATE SEQUENCE "public"."bagging_bagging_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bagging_bagging_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bagging_item_bagging_item_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bagging_item_bagging_item_id_seq";
CREATE SEQUENCE "public"."bagging_item_bagging_item_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bagging_item_bagging_item_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bank_bank_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bank_bank_id_seq";
CREATE SEQUENCE "public"."bank_bank_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bank_bank_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for bank_branch_bank_branch_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."bank_branch_bank_branch_id_seq";
CREATE SEQUENCE "public"."bank_branch_bank_branch_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."bank_branch_bank_branch_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for branch_branch_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."branch_branch_id_seq";
CREATE SEQUENCE "public"."branch_branch_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."branch_branch_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for branch_region_branch_region_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."branch_region_branch_region_id_seq";
CREATE SEQUENCE "public"."branch_region_branch_region_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."branch_region_branch_region_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for branch_software_branch_software_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."branch_software_branch_software_id_seq";
CREATE SEQUENCE "public"."branch_software_branch_software_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."branch_software_branch_software_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for calculation_discount_calculation_discount_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."calculation_discount_calculation_discount_id_seq";
CREATE SEQUENCE "public"."calculation_discount_calculation_discount_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."calculation_discount_calculation_discount_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for calculation_discount_history_calculation_discount_history_id_se
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."calculation_discount_history_calculation_discount_history_id_se";
CREATE SEQUENCE "public"."calculation_discount_history_calculation_discount_history_id_se" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."calculation_discount_history_calculation_discount_history_id_se" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for city_city_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."city_city_id_seq";
CREATE SEQUENCE "public"."city_city_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."city_city_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for cms_option_cms_option_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."cms_option_cms_option_id_seq";
CREATE SEQUENCE "public"."cms_option_cms_option_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."cms_option_cms_option_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for country_country_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."country_country_id_seq";
CREATE SEQUENCE "public"."country_country_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."country_country_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_account_change_customer_account_change_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_account_change_customer_account_change_id_seq";
CREATE SEQUENCE "public"."customer_account_change_customer_account_change_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_account_change_customer_account_change_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_account_customer_account_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_account_customer_account_id_seq";
CREATE SEQUENCE "public"."customer_account_customer_account_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_account_customer_account_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_account_merchant_customer_account_merchant_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_account_merchant_customer_account_merchant_id_seq";
CREATE SEQUENCE "public"."customer_account_merchant_customer_account_merchant_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_account_merchant_customer_account_merchant_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_account_post_history_customer_account_post_history_id_
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_account_post_history_customer_account_post_history_id_";
CREATE SEQUENCE "public"."customer_account_post_history_customer_account_post_history_id_" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_account_post_history_customer_account_post_history_id_" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_address_customer_address_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_address_customer_address_id_seq";
CREATE SEQUENCE "public"."customer_address_customer_address_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_address_customer_address_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_bank_change_customer_bank_change_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_bank_change_customer_bank_change_id_seq";
CREATE SEQUENCE "public"."customer_bank_change_customer_bank_change_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_bank_change_customer_bank_change_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_bank_customer_bank_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_bank_customer_bank_id_seq";
CREATE SEQUENCE "public"."customer_bank_customer_bank_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_bank_customer_bank_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_category_customer_category_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_category_customer_category_id_seq";
CREATE SEQUENCE "public"."customer_category_customer_category_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_category_customer_category_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_customer_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_customer_id_seq";
CREATE SEQUENCE "public"."customer_customer_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_customer_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_grade_customer_grade_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_grade_customer_grade_id_seq";
CREATE SEQUENCE "public"."customer_grade_customer_grade_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_grade_customer_grade_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_meta_change_customer_meta_change_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_meta_change_customer_meta_change_id_seq";
CREATE SEQUENCE "public"."customer_meta_change_customer_meta_change_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_meta_change_customer_meta_change_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_meta_customer_meta_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_meta_customer_meta_id_seq";
CREATE SEQUENCE "public"."customer_meta_customer_meta_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_meta_customer_meta_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_pickup_customer_pickup_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_pickup_customer_pickup_id_seq";
CREATE SEQUENCE "public"."customer_pickup_customer_pickup_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_pickup_customer_pickup_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_setting_customer_setting_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_setting_customer_setting_id_seq";
CREATE SEQUENCE "public"."customer_setting_customer_setting_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_setting_customer_setting_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for customer_setting_detail_customer_setting_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."customer_setting_detail_customer_setting_detail_id_seq";
CREATE SEQUENCE "public"."customer_setting_detail_customer_setting_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."customer_setting_detail_customer_setting_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for department_department_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."department_department_id_seq";
CREATE SEQUENCE "public"."department_department_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."department_department_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for detail_email_at_night_detail_email_at_night_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."detail_email_at_night_detail_email_at_night_id_seq";
CREATE SEQUENCE "public"."detail_email_at_night_detail_email_at_night_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."detail_email_at_night_detail_email_at_night_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for detail_lph_detail_lph_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."detail_lph_detail_lph_id_seq";
CREATE SEQUENCE "public"."detail_lph_detail_lph_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."detail_lph_detail_lph_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for district_district_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."district_district_id_seq";
CREATE SEQUENCE "public"."district_district_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."district_district_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for district_reference_district_reference_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."district_reference_district_reference_id_seq";
CREATE SEQUENCE "public"."district_reference_district_reference_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."district_reference_district_reference_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for division_department_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."division_department_id_seq";
CREATE SEQUENCE "public"."division_department_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."division_department_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for division_division_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."division_division_id_seq";
CREATE SEQUENCE "public"."division_division_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."division_division_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pickup_detail_do_pickup_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pickup_detail_do_pickup_detail_id_seq";
CREATE SEQUENCE "public"."do_pickup_detail_do_pickup_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pickup_detail_do_pickup_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pickup_do_pickup_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pickup_do_pickup_id_seq";
CREATE SEQUENCE "public"."do_pickup_do_pickup_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pickup_do_pickup_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pod_deliver_detail_do_pod_deliver_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pod_deliver_detail_do_pod_deliver_detail_id_seq";
CREATE SEQUENCE "public"."do_pod_deliver_detail_do_pod_deliver_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pod_deliver_detail_do_pod_deliver_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pod_deliver_do_pod_deliver_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pod_deliver_do_pod_deliver_id_seq";
CREATE SEQUENCE "public"."do_pod_deliver_do_pod_deliver_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pod_deliver_do_pod_deliver_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pod_deliver_history_do_pod_deliver_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pod_deliver_history_do_pod_deliver_history_id_seq";
CREATE SEQUENCE "public"."do_pod_deliver_history_do_pod_deliver_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pod_deliver_history_do_pod_deliver_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pod_detail_do_pod_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pod_detail_do_pod_detail_id_seq";
CREATE SEQUENCE "public"."do_pod_detail_do_pod_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pod_detail_do_pod_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pod_do_pod_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pod_do_pod_id_seq";
CREATE SEQUENCE "public"."do_pod_do_pod_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pod_do_pod_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pod_history_do_pod_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pod_history_do_pod_history_id_seq";
CREATE SEQUENCE "public"."do_pod_history_do_pod_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pod_history_do_pod_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_pod_status_do_pod_status_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_pod_status_do_pod_status_id_seq";
CREATE SEQUENCE "public"."do_pod_status_do_pod_status_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_pod_status_do_pod_status_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_smu_detail_do_smu_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_smu_detail_do_smu_detail_id_seq";
CREATE SEQUENCE "public"."do_smu_detail_do_smu_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_smu_detail_do_smu_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_smu_do_smu_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_smu_do_smu_id_seq";
CREATE SEQUENCE "public"."do_smu_do_smu_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_smu_do_smu_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_smu_history_do_smu_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_smu_history_do_smu_history_id_seq";
CREATE SEQUENCE "public"."do_smu_history_do_smu_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_smu_history_do_smu_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_smu_status_do_smu_status_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_smu_status_do_smu_status_id_seq";
CREATE SEQUENCE "public"."do_smu_status_do_smu_status_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_smu_status_do_smu_status_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_work_order_detail_do_work_order_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_work_order_detail_do_work_order_detail_id_seq";
CREATE SEQUENCE "public"."do_work_order_detail_do_work_order_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_work_order_detail_do_work_order_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for do_work_order_do_work_order_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."do_work_order_do_work_order_id_seq";
CREATE SEQUENCE "public"."do_work_order_do_work_order_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."do_work_order_do_work_order_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for email_at_night_email_at_night_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."email_at_night_email_at_night_id_seq";
CREATE SEQUENCE "public"."email_at_night_email_at_night_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."email_at_night_email_at_night_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for email_log_email_log_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."email_log_email_log_id_seq";
CREATE SEQUENCE "public"."email_log_email_log_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."email_log_email_log_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for email_log_history_email_log_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."email_log_history_email_log_history_id_seq";
CREATE SEQUENCE "public"."email_log_history_email_log_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."email_log_history_email_log_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_education_employee_education_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_education_employee_education_id_seq";
CREATE SEQUENCE "public"."employee_education_employee_education_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_education_employee_education_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_employee_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_employee_id_seq";
CREATE SEQUENCE "public"."employee_employee_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_employee_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_experience_employee_experience_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_experience_employee_experience_id_seq";
CREATE SEQUENCE "public"."employee_experience_employee_experience_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_experience_employee_experience_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_family_employee_family_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_family_employee_family_id_seq";
CREATE SEQUENCE "public"."employee_family_employee_family_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_family_employee_family_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_journal_employee_journal_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_journal_employee_journal_id_seq";
CREATE SEQUENCE "public"."employee_journal_employee_journal_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_journal_employee_journal_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_journey_employee_journey_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_journey_employee_journey_id_seq";
CREATE SEQUENCE "public"."employee_journey_employee_journey_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_journey_employee_journey_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_role_employee_role_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_role_employee_role_id_seq";
CREATE SEQUENCE "public"."employee_role_employee_role_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_role_employee_role_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_source_employee_source_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_source_employee_source_id_seq";
CREATE SEQUENCE "public"."employee_source_employee_source_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_source_employee_source_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for employee_type_employee_type_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."employee_type_employee_type_id_seq";
CREATE SEQUENCE "public"."employee_type_employee_type_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."employee_type_employee_type_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for industry_type_industry_type_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."industry_type_industry_type_id_seq";
CREATE SEQUENCE "public"."industry_type_industry_type_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."industry_type_industry_type_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for invoice_detail_invoice_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."invoice_detail_invoice_detail_id_seq";
CREATE SEQUENCE "public"."invoice_detail_invoice_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."invoice_detail_invoice_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for invoice_invoice_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."invoice_invoice_id_seq";
CREATE SEQUENCE "public"."invoice_invoice_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."invoice_invoice_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for items_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."items_id_seq";
CREATE SEQUENCE "public"."items_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."items_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for log_history_log_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."log_history_log_history_id_seq";
CREATE SEQUENCE "public"."log_history_log_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."log_history_log_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for log_login_fail_log_login_fail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."log_login_fail_log_login_fail_id_seq";
CREATE SEQUENCE "public"."log_login_fail_log_login_fail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."log_login_fail_log_login_fail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for log_login_log_login_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."log_login_log_login_id_seq";
CREATE SEQUENCE "public"."log_login_log_login_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."log_login_log_login_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for lph_lph_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."lph_lph_id_seq";
CREATE SEQUENCE "public"."lph_lph_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."lph_lph_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for menu_menu_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."menu_menu_id_seq";
CREATE SEQUENCE "public"."menu_menu_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."menu_menu_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for migrations_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."migrations_id_seq";
CREATE SEQUENCE "public"."migrations_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."migrations_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for notification_msg_notification_msg_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."notification_msg_notification_msg_id_seq";
CREATE SEQUENCE "public"."notification_msg_notification_msg_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."notification_msg_notification_msg_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for notification_token_notification_token_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."notification_token_notification_token_id_seq";
CREATE SEQUENCE "public"."notification_token_notification_token_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."notification_token_notification_token_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for package_price_package_price_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."package_price_package_price_id_seq";
CREATE SEQUENCE "public"."package_price_package_price_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."package_price_package_price_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for package_price_special_package_price_special_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."package_price_special_package_price_special_id_seq";
CREATE SEQUENCE "public"."package_price_special_package_price_special_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."package_price_special_package_price_special_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for package_type_package_type_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."package_type_package_type_id_seq";
CREATE SEQUENCE "public"."package_type_package_type_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."package_type_package_type_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for partner_logistic_partner_logistic_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."partner_logistic_partner_logistic_id_seq";
CREATE SEQUENCE "public"."partner_logistic_partner_logistic_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."partner_logistic_partner_logistic_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for partner_partner_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."partner_partner_id_seq";
CREATE SEQUENCE "public"."partner_partner_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."partner_partner_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for payment_method_payment_method_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."payment_method_payment_method_id_seq";
CREATE SEQUENCE "public"."payment_method_payment_method_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."payment_method_payment_method_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pickup_request_detail_pickup_request_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pickup_request_detail_pickup_request_detail_id_seq";
CREATE SEQUENCE "public"."pickup_request_detail_pickup_request_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pickup_request_detail_pickup_request_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pickup_request_invalid_pickup_request_invalid_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pickup_request_invalid_pickup_request_invalid_id_seq";
CREATE SEQUENCE "public"."pickup_request_invalid_pickup_request_invalid_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pickup_request_invalid_pickup_request_invalid_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pickup_request_log_pickup_request_log_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pickup_request_log_pickup_request_log_id_seq";
CREATE SEQUENCE "public"."pickup_request_log_pickup_request_log_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pickup_request_log_pickup_request_log_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pickup_request_pickup_request_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pickup_request_pickup_request_id_seq";
CREATE SEQUENCE "public"."pickup_request_pickup_request_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pickup_request_pickup_request_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pickup_request_upload_detail_pickup_request_upload_detail_id_se
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pickup_request_upload_detail_pickup_request_upload_detail_id_se";
CREATE SEQUENCE "public"."pickup_request_upload_detail_pickup_request_upload_detail_id_se" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pickup_request_upload_detail_pickup_request_upload_detail_id_se" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pickup_request_upload_pickup_request_upload_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pickup_request_upload_pickup_request_upload_id_seq";
CREATE SEQUENCE "public"."pickup_request_upload_pickup_request_upload_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pickup_request_upload_pickup_request_upload_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for place_place_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."place_place_id_seq";
CREATE SEQUENCE "public"."place_place_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."place_place_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for place_type_place_type_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."place_type_place_type_id_seq";
CREATE SEQUENCE "public"."place_type_place_type_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."place_type_place_type_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pod_scan_in_pod_scan_in_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pod_scan_in_pod_scan_in_id_seq";
CREATE SEQUENCE "public"."pod_scan_in_pod_scan_in_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pod_scan_in_pod_scan_in_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for pod_scan_pod_scan_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pod_scan_pod_scan_id_seq";
CREATE SEQUENCE "public"."pod_scan_pod_scan_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."pod_scan_pod_scan_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for price_list_price_list_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."price_list_price_list_id_seq";
CREATE SEQUENCE "public"."price_list_price_list_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."price_list_price_list_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for province_province_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."province_province_id_seq";
CREATE SEQUENCE "public"."province_province_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."province_province_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for reason_reason_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."reason_reason_id_seq";
CREATE SEQUENCE "public"."reason_reason_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."reason_reason_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for received_package_detail_received_package_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."received_package_detail_received_package_detail_id_seq";
CREATE SEQUENCE "public"."received_package_detail_received_package_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."received_package_detail_received_package_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for received_package_received_package_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."received_package_received_package_id_seq";
CREATE SEQUENCE "public"."received_package_received_package_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."received_package_received_package_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for representative_representative_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."representative_representative_id_seq";
CREATE SEQUENCE "public"."representative_representative_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."representative_representative_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for reseller_reseller_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."reseller_reseller_id_seq";
CREATE SEQUENCE "public"."reseller_reseller_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."reseller_reseller_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for role_permission_access_role_permission_access_id
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."role_permission_access_role_permission_access_id";
CREATE SEQUENCE "public"."role_permission_access_role_permission_access_id" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."role_permission_access_role_permission_access_id" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for role_permission_dashboard_role_permission_dashboard_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."role_permission_dashboard_role_permission_dashboard_id_seq";
CREATE SEQUENCE "public"."role_permission_dashboard_role_permission_dashboard_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."role_permission_dashboard_role_permission_dashboard_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for role_permission_role_permission_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."role_permission_role_permission_id_seq";
CREATE SEQUENCE "public"."role_permission_role_permission_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."role_permission_role_permission_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for role_role_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."role_role_id_seq";
CREATE SEQUENCE "public"."role_role_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."role_role_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for smu_item_smu_item_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."smu_item_smu_item_id_seq";
CREATE SEQUENCE "public"."smu_item_smu_item_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."smu_item_smu_item_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for smu_load_smu_load_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."smu_load_smu_load_id_seq";
CREATE SEQUENCE "public"."smu_load_smu_load_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."smu_load_smu_load_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for smu_smu_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."smu_smu_id_seq";
CREATE SEQUENCE "public"."smu_smu_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."smu_smu_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for social_media_social_media_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."social_media_social_media_id_seq";
CREATE SEQUENCE "public"."social_media_social_media_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."social_media_social_media_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for sync_awb_file_sync_awb_file_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sync_awb_file_sync_awb_file_id_seq";
CREATE SEQUENCE "public"."sync_awb_file_sync_awb_file_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."sync_awb_file_sync_awb_file_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for sync_awb_sync_awb_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sync_awb_sync_awb_id_seq";
CREATE SEQUENCE "public"."sync_awb_sync_awb_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."sync_awb_sync_awb_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for sync_master_history_sync_master_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sync_master_history_sync_master_history_id_seq";
CREATE SEQUENCE "public"."sync_master_history_sync_master_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."sync_master_history_sync_master_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for sync_master_sync_master_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sync_master_sync_master_id_seq";
CREATE SEQUENCE "public"."sync_master_sync_master_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."sync_master_sync_master_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for sys_counter_sys_counter_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sys_counter_sys_counter_id_seq";
CREATE SEQUENCE "public"."sys_counter_sys_counter_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."sys_counter_sys_counter_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for todos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."todos_id_seq";
CREATE SEQUENCE "public"."todos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."todos_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for user_api_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."user_api_id_seq";
CREATE SEQUENCE "public"."user_api_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."user_api_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for user_notification_msg_user_notification_msg_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."user_notification_msg_user_notification_msg_id_seq";
CREATE SEQUENCE "public"."user_notification_msg_user_notification_msg_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."user_notification_msg_user_notification_msg_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for user_role_user_role_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."user_role_user_role_id_seq";
CREATE SEQUENCE "public"."user_role_user_role_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."user_role_user_role_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for user_user_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."user_user_id_seq";
CREATE SEQUENCE "public"."user_user_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."user_user_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for work_order_detail_work_order_detail_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."work_order_detail_work_order_detail_id_seq";
CREATE SEQUENCE "public"."work_order_detail_work_order_detail_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."work_order_detail_work_order_detail_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for work_order_history_work_order_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."work_order_history_work_order_history_id_seq";
CREATE SEQUENCE "public"."work_order_history_work_order_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."work_order_history_work_order_history_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for work_order_schedule_work_order_schedule_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."work_order_schedule_work_order_schedule_id_seq";
CREATE SEQUENCE "public"."work_order_schedule_work_order_schedule_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."work_order_schedule_work_order_schedule_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for work_order_status_work_order_status_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."work_order_status_work_order_status_id_seq";
CREATE SEQUENCE "public"."work_order_status_work_order_status_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."work_order_status_work_order_status_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for work_order_work_order_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."work_order_work_order_id_seq";
CREATE SEQUENCE "public"."work_order_work_order_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."work_order_work_order_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for zone_zone_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."zone_zone_id_seq";
CREATE SEQUENCE "public"."zone_zone_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."zone_zone_id_seq" OWNER TO "postgres";

-- ----------------------------
-- Table structure for airline
-- ----------------------------
DROP TABLE IF EXISTS "public"."airline";
CREATE TABLE "public"."airline" (
  "airline_id" int8 NOT NULL DEFAULT nextval('airline_airline_id_seq'::regclass),
  "airline_code" varchar(255) COLLATE "pg_catalog"."default",
  "airline_name" varchar(255) COLLATE "pg_catalog"."default",
  "attachment_id" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."airline" OWNER TO "postgres";

-- ----------------------------
-- Table structure for airport
-- ----------------------------
DROP TABLE IF EXISTS "public"."airport";
CREATE TABLE "public"."airport" (
  "airport_id" int8 NOT NULL DEFAULT nextval('airport_airport_id_seq'::regclass),
  "airport_code" varchar(255) COLLATE "pg_catalog"."default",
  "airport_name" varchar(255) COLLATE "pg_catalog"."default",
  "city_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "representative_id" int8 NOT NULL DEFAULT 0
)
;
ALTER TABLE "public"."airport" OWNER TO "postgres";

-- ----------------------------
-- Table structure for ar_internal_metadata
-- ----------------------------
DROP TABLE IF EXISTS "public"."ar_internal_metadata";
CREATE TABLE "public"."ar_internal_metadata" (
  "key" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "value" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL,
  "updated_at" timestamp(6) NOT NULL
)
;
ALTER TABLE "public"."ar_internal_metadata" OWNER TO "postgres";

-- ----------------------------
-- Table structure for attachment
-- ----------------------------
DROP TABLE IF EXISTS "public"."attachment";
CREATE TABLE "public"."attachment" (
  "attachment_id" int8 NOT NULL DEFAULT nextval('attachment_attachment_id_seq'::regclass),
  "url" varchar(500) COLLATE "pg_catalog"."default",
  "attachment_path" varchar(255) COLLATE "pg_catalog"."default",
  "attachment_name" varchar(255) COLLATE "pg_catalog"."default",
  "filename" varchar(255) COLLATE "pg_catalog"."default",
  "is_used" bool NOT NULL DEFAULT false,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."attachment" OWNER TO "postgres";

-- ----------------------------
-- Table structure for attachment_tms
-- ----------------------------
DROP TABLE IF EXISTS "public"."attachment_tms";
CREATE TABLE "public"."attachment_tms" (
  "attachment_tms_id" int8 NOT NULL DEFAULT nextval('attachment_tms_attachment_tms_id_seq'::regclass),
  "url" varchar(500) COLLATE "pg_catalog"."default",
  "attachment_path" varchar(255) COLLATE "pg_catalog"."default",
  "attachment_name" varchar(255) COLLATE "pg_catalog"."default",
  "filename" varchar(255) COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "is_used" bool NOT NULL DEFAULT false,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."attachment_tms" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb";
CREATE TABLE "public"."awb" (
  "awb_id" int8 NOT NULL DEFAULT nextval('awb_awb_id_seq'::regclass),
  "awb_version" int4 NOT NULL DEFAULT 1,
  "awb_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_number" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_booking_id" int8 NOT NULL,
  "reference_code" varchar(255) COLLATE "pg_catalog"."default",
  "ref_awb_number" varchar(255) COLLATE "pg_catalog"."default",
  "ref_transaction_number" varchar(255) COLLATE "pg_catalog"."default",
  "awb_date" timestamp(6),
  "awb_date_real" timestamp(6),
  "consignee_title" varchar(500) COLLATE "pg_catalog"."default",
  "consignee_name" varchar(500) COLLATE "pg_catalog"."default",
  "consignee_address" text COLLATE "pg_catalog"."default",
  "consignee_phone" varchar(255) COLLATE "pg_catalog"."default",
  "consignee_zip" varchar(255) COLLATE "pg_catalog"."default",
  "consignee_district" varchar(255) COLLATE "pg_catalog"."default",
  "district_id_consignee" int8,
  "user_id" int8,
  "branch_id" int8,
  "customer_account_id" int8,
  "employee_id_sales" int8,
  "employee_id_cro" int8,
  "employee_id_finance" int8,
  "reseller_id" int8,
  "package_type_id" int8,
  "from_type" int4,
  "from_id" int8,
  "to_type" int4,
  "to_id" int8,
  "lead_time_min_days" numeric(10,5) NOT NULL DEFAULT 0,
  "lead_time_max_days" numeric(10,5) NOT NULL DEFAULT 0,
  "total_weight" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_real" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_real_rounded" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_rounded" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_volume" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_volume_rounded" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_final" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_final_rounded" numeric(20,5) NOT NULL DEFAULT 0,
  "base_price" numeric(20,5) NOT NULL DEFAULT 0,
  "disc_percent" numeric(20,5) NOT NULL DEFAULT 0,
  "disc_value" numeric(20,5) NOT NULL DEFAULT 0,
  "sell_price" numeric(20,5) NOT NULL DEFAULT 0,
  "total_base_price" numeric(20,5) NOT NULL DEFAULT 0,
  "total_disc_percent" numeric(20,5) NOT NULL DEFAULT 0,
  "total_disc_value" numeric(20,5) NOT NULL DEFAULT 0,
  "total_sell_price" numeric(20,5) NOT NULL DEFAULT 0,
  "total_item_price" numeric(20,5) NOT NULL DEFAULT 0,
  "insurance" numeric(20,5) NOT NULL DEFAULT 0,
  "insurance_admin" numeric(20,5) NOT NULL DEFAULT 0,
  "total_insurance" numeric(20,5) NOT NULL DEFAULT 0,
  "total_cod_value" numeric(20,5) NOT NULL DEFAULT 0,
  "awb_history_id_last" int8,
  "awb_status_id_last" int4,
  "awb_status_id_last_public" int4 DEFAULT 2000,
  "user_id_last" int8,
  "branch_id_last" int8,
  "lead_time_run_days" int4 NOT NULL DEFAULT 0,
  "history_date_last" timestamp(6),
  "final_status_date" timestamp(6),
  "awb_status_id_final" int4,
  "lead_time_final_days" int4 NOT NULL DEFAULT 0,
  "payment_method_id" int8,
  "notes" text COLLATE "pg_catalog"."default",
  "total_volume" numeric(20,5) NOT NULL DEFAULT 0,
  "total_item" int4 NOT NULL DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6),
  "is_deleted" bool NOT NULL DEFAULT false,
  "try_attempt" int4 NOT NULL DEFAULT 0,
  "total_cod_item_price" numeric(20,5) NOT NULL DEFAULT 0,
  "ref_user_id" varchar(255) COLLATE "pg_catalog"."default",
  "ref_branch_id" varchar(255) COLLATE "pg_catalog"."default",
  "ref_customer_account_id" varchar(255) COLLATE "pg_catalog"."default",
  "confirm_number" varchar(255) COLLATE "pg_catalog"."default",
  "is_sync_pod" bool NOT NULL DEFAULT false,
  "is_cod" bool NOT NULL DEFAULT false,
  "is_sync_erp" bool NOT NULL DEFAULT false,
  "ref_reseller" varchar(255) COLLATE "pg_catalog"."default",
  "ref_reseller_phone" varchar(255) COLLATE "pg_catalog"."default",
  "ref_awb_number_jne" varchar(255) COLLATE "pg_catalog"."default",
  "ref_origin_code" varchar(255) COLLATE "pg_catalog"."default",
  "ref_destination_code" varchar(255) COLLATE "pg_catalog"."default",
  "prev_customer_account_id" int8,
  "ref_prev_customer_account_id" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_merchant" varchar(255) COLLATE "pg_catalog"."default",
  "email_merchant" varchar(255) COLLATE "pg_catalog"."default",
  "is_jne" bool,
  "ref_representative_code" varchar(3) COLLATE "pg_catalog"."default",
  "awb_trouble_id" int8
)
;
ALTER TABLE "public"."awb" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_attr
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_attr";
CREATE TABLE "public"."awb_attr" (
  "awb_attr_id" int8 NOT NULL DEFAULT nextval('awb_attr_awb_attr_id_seq'::regclass),
  "awb_id" int8,
  "awb_history_id_last" int8,
  "awb_status_id_last" int4,
  "awb_status_id_last_public" int4 NOT NULL DEFAULT 2000,
  "user_id_last" int8,
  "branch_id_last" int8,
  "lead_time_run_days" int4 NOT NULL DEFAULT 0,
  "history_date_last" timestamp(6),
  "final_status_date" timestamp(6),
  "awb_status_id_final" int4,
  "lead_time_final_days" int4 NOT NULL DEFAULT 0,
  "uuid" varchar(50) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "try_attempt" int4 NOT NULL DEFAULT 0,
  "branch_id_next" int8,
  "awb_number" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."awb_attr" OWNER TO "postgres";
COMMENT ON COLUMN "public"."awb_attr"."branch_id_next" IS 'for adding next destination only for out status';

-- ----------------------------
-- Table structure for awb_booking
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_booking";
CREATE TABLE "public"."awb_booking" (
  "awb_booking_id" int8 NOT NULL DEFAULT nextval('awb_booking_awb_booking_id_seq'::regclass),
  "customer_account_id" int8 NOT NULL,
  "awb_number" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_booking_status_id" int8 NOT NULL DEFAULT 1,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "awb_request_id" int8
)
;
ALTER TABLE "public"."awb_booking" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_booking_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_booking_status";
CREATE TABLE "public"."awb_booking_status" (
  "awb_booking_status_id" int4 NOT NULL,
  "awb_booking_status_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_booking_status" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_detail";
CREATE TABLE "public"."awb_detail" (
  "awb_detail_id" int8 NOT NULL DEFAULT nextval('awb_detail_awb_detail_id_seq'::regclass),
  "awb_id" int8 NOT NULL,
  "attachment_id" int8 NOT NULL,
  "width" numeric(10,5),
  "length" numeric(10,5),
  "height" numeric(10,5),
  "volume" numeric(10,5),
  "divider_volume" numeric(10,5),
  "weight_volume" numeric(20,5),
  "weight_volume_rounded" numeric(20,5),
  "weight" numeric(20,5),
  "weight_rounded" numeric(20,5),
  "weight_final" numeric(20,5),
  "item_price" numeric(10,5),
  "insurance" numeric(10,5),
  "users_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "users_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6),
  "is_deleted" bool NOT NULL DEFAULT false,
  "bag_item_id_latest" int8
)
;
ALTER TABLE "public"."awb_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_history";
CREATE TABLE "public"."awb_history" (
  "awb_history_id" int8 NOT NULL DEFAULT nextval('awb_history_awb_history_id_seq'::regclass),
  "awb_item_id" int8,
  "user_id" int8,
  "branch_id" int8,
  "history_date" timestamp(6) NOT NULL,
  "awb_status_id" int8,
  "awb_note" text COLLATE "pg_catalog"."default",
  "customer_account_id" int8,
  "ref_id_tracking_note" int8,
  "ref_id_tracking_site" int8,
  "ref_id_cust_package" varchar(255) COLLATE "pg_catalog"."default",
  "ref_awb_number" varchar(50) COLLATE "pg_catalog"."default",
  "ref_tracking_site_code" varchar(255) COLLATE "pg_catalog"."default",
  "ref_tracking_site_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_partner_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_recipient_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id_courier" int8,
  "ref_courier_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_tracking_type" varchar(255) COLLATE "pg_catalog"."default",
  "ref_user_created" varchar(255) COLLATE "pg_catalog"."default",
  "ref_user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "ref_table" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id" int8,
  "ref_module" varchar(255) COLLATE "pg_catalog"."default",
  "employee_id_driver" int8,
  "is_scan_single" bool DEFAULT true,
  "is_direction_back" bool DEFAULT false,
  "latitude" varchar(500) COLLATE "pg_catalog"."default",
  "longitude" varchar(500) COLLATE "pg_catalog"."default",
  "awb_history_id_prev" int8
)
;
ALTER TABLE "public"."awb_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_invalid
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_invalid";
CREATE TABLE "public"."awb_invalid" (
  "awb_invalid_id" int8 NOT NULL DEFAULT nextval('awb_invalid_awb_invalid_id_seq'::regclass),
  "awb_date_time" timestamp(6),
  "ref_awb_number" varchar(100) COLLATE "pg_catalog"."default",
  "message_error" varchar(500) COLLATE "pg_catalog"."default",
  "booking_customer_account_id" int8,
  "current_customer_account_id" int8,
  "request" json,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_invalid" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_item
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_item";
CREATE TABLE "public"."awb_item" (
  "awb_item_id" int8 NOT NULL DEFAULT nextval('awb_item_awb_item_id_seq'::regclass),
  "awb_id" int8 NOT NULL,
  "bag_item_id_last" int8,
  "do_awb_id_delivery" int8,
  "do_awb_id_pickup" int8,
  "attachment_tms_id" int8,
  "awb_item_seq" int4 DEFAULT 1,
  "width" numeric(20,5),
  "length" numeric(20,5),
  "height" numeric(20,5),
  "volume" numeric(20,5),
  "divider_volume" numeric(20,5),
  "weight_volume" numeric(20,5),
  "weight_volume_rounded" numeric(20,5),
  "weight" numeric(20,5),
  "weight_rounded" numeric(20,5),
  "weight_final" numeric(20,5),
  "awb_item_price" numeric(20,5),
  "insurance" numeric(20,5),
  "packing_type_id" int8,
  "packing_price" numeric(20,5),
  "item_description" text COLLATE "pg_catalog"."default",
  "item_qty" numeric(20,5),
  "item_unit" varchar(255) COLLATE "pg_catalog"."default",
  "item_price" numeric(20,5),
  "awb_status_id_last" int4,
  "awb_status_id_last_public" int4 NOT NULL DEFAULT 2000,
  "user_id_last" int8,
  "branch_id_last" int8,
  "history_date_last" timestamp(6),
  "try_attempt" int4 NOT NULL DEFAULT 0,
  "awb_date" timestamp(6),
  "awb_date_real" timestamp(6),
  "awb_history_id_last" int8,
  "lead_time_run_days" int4 NOT NULL DEFAULT 0,
  "final_status_date" timestamp(6),
  "awb_status_id_final" int4,
  "lead_time_final_days" int4 NOT NULL DEFAULT 0,
  "weight_real" numeric(20,5) DEFAULT 0,
  "weight_real_rounded" numeric(20,5) DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6),
  "is_deleted" bool NOT NULL DEFAULT false,
  "cod_item_price" numeric(20,5) NOT NULL DEFAULT 0,
  "cod_value" numeric(20,5) NOT NULL DEFAULT 0
)
;
ALTER TABLE "public"."awb_item" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_item_attr
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_item_attr";
CREATE TABLE "public"."awb_item_attr" (
  "awb_item_attr_id" int8 NOT NULL DEFAULT nextval('awb_attr_awb_attr_id_seq'::regclass),
  "awb_item_id" int8,
  "awb_number" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_history_id_last" int8,
  "awb_status_id_last" int4,
  "awb_status_id_last_public" int4 NOT NULL DEFAULT 2000,
  "user_id_last" int8,
  "branch_id_last" int8,
  "branch_id_next" int8,
  "history_date_last" timestamp(6),
  "lead_time_run_days" int4 NOT NULL DEFAULT 0,
  "final_status_date" timestamp(6),
  "try_attempt" int4 NOT NULL DEFAULT 0,
  "bag_item_id_last" int8,
  "is_district_filtered" bool NOT NULL DEFAULT false,
  "awb_status_id_final" int4,
  "lead_time_final_days" int4 NOT NULL DEFAULT 0,
  "uuid" varchar(50) COLLATE "pg_catalog"."default",
  "awb_third_party" varchar(100) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_item_attr" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_item_summary
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_item_summary";
CREATE TABLE "public"."awb_item_summary" (
  "awb_item_summary_id" int8 NOT NULL DEFAULT nextval('awb_item_summary_awb_item_summary_id_seq'::regclass),
  "awb_item_id" int8,
  "summary_date" timestamp(6),
  "awb_history_id_last" int8,
  "awb_status_id_last" int8,
  "awb_status_id_last_public" int8 NOT NULL DEFAULT 2000,
  "user_id_last" int8,
  "branch_id_last" int8,
  "history_date_last" timestamp(6),
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "branch_id_next" int8
)
;
ALTER TABLE "public"."awb_item_summary" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_price
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_price";
CREATE TABLE "public"."awb_price" (
  "awb_price_id" int8 NOT NULL DEFAULT nextval('awb_price_awb_price_id_seq'::regclass),
  "awb_number" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_date" timestamp(6),
  "customer_account_id" int8,
  "package_type_id" int8,
  "from_type" int4,
  "from_id" int8,
  "to_type" int4,
  "to_id" int8,
  "disc_percent" numeric(20,5) DEFAULT 0,
  "disc_value" numeric(20,5) DEFAULT 0,
  "fix_price_disc" numeric(20,5) DEFAULT 0,
  "amount" numeric(20,5) DEFAULT 0,
  "final_amount" numeric(20,5) DEFAULT 0,
  "total_weight_real" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_final_rounded" numeric(20,5) NOT NULL DEFAULT 0,
  "grand_total_sell_price" numeric(20,5) NOT NULL DEFAULT 0,
  "insurance" numeric(20,5) NOT NULL DEFAULT 0,
  "insurance_admin" numeric(20,5) NOT NULL DEFAULT 0,
  "total_insurance" numeric(20,5) NOT NULL DEFAULT 0,
  "cod_value" numeric(20,5) NOT NULL DEFAULT 0,
  "ref_table" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id" int8,
  "branch_id" int8,
  "employee_id_sales" int8,
  "employee_id_cro" int8,
  "employee_id_finance" int8,
  "consignee_title" varchar(500) COLLATE "pg_catalog"."default",
  "consignee_name" varchar(500) COLLATE "pg_catalog"."default",
  "consignee_address" text COLLATE "pg_catalog"."default",
  "consignee_phone" varchar(255) COLLATE "pg_catalog"."default",
  "consignee_zip" varchar(255) COLLATE "pg_catalog"."default",
  "consignee_district" varchar(255) COLLATE "pg_catalog"."default",
  "district_id_consignee" int8,
  "calculate_date" timestamp(6),
  "awb_booking_id" int8 NOT NULL,
  "invoice_id" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "ref_awb_number_jne" varchar(255) COLLATE "pg_catalog"."default",
  "is_jne" bool DEFAULT false,
  "ref_representative_code" varchar(3) COLLATE "pg_catalog"."default",
  "pickup_merchant" varchar(255) COLLATE "pg_catalog"."default",
  "email_merchant" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."awb_price" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_price_item
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_price_item";
CREATE TABLE "public"."awb_price_item" (
  "awb_price_item_id" int8 NOT NULL DEFAULT nextval('awb_price_item_awb_price_item_id_seq'::regclass),
  "awb_item_id" int8 NOT NULL,
  "awb_price_id" int8 NOT NULL,
  "weight_real" numeric(20,5) NOT NULL DEFAULT 0,
  "weight_final" numeric(20,5) NOT NULL DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_price_item" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_request
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_request";
CREATE TABLE "public"."awb_request" (
  "awb_request_id" int8 NOT NULL DEFAULT nextval('awb_request_awb_request_id_seq'::regclass),
  "awb_request_code" varchar(255) COLLATE "pg_catalog"."default",
  "customer_account_id" int8,
  "partner_id" int8,
  "awb_number_start" varchar(255) COLLATE "pg_catalog"."default",
  "awb_number_end" varchar(255) COLLATE "pg_catalog"."default",
  "total_awb_request" int8 NOT NULL DEFAULT 0,
  "total_awb_created" int8 NOT NULL DEFAULT 0,
  "awb_request_status" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "awb_request_type" varchar(255) COLLATE "pg_catalog"."default",
  "total_valid" int8,
  "total_invalid" int8
)
;
ALTER TABLE "public"."awb_request" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_solution
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_solution";
CREATE TABLE "public"."awb_solution" (
  "awb_solution_id" int8 NOT NULL DEFAULT nextval('awb_solution_awb_solution_id_seq'::regclass),
  "awb_history_id" int8,
  "awb_trouble_id" int8,
  "awb_solution_desc" varchar(500) COLLATE "pg_catalog"."default",
  "user_id_created" int8,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_solution" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_status";
CREATE TABLE "public"."awb_status" (
  "awb_status_id" int4 NOT NULL,
  "awb_status_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_status_title" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_visibility" int4 NOT NULL,
  "awb_level" int4 NOT NULL,
  "awb_desc" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "is_final_status" bool DEFAULT false,
  "is_attempted" bool DEFAULT false,
  "is_problem" bool DEFAULT false
)
;
ALTER TABLE "public"."awb_status" OWNER TO "postgres";
COMMENT ON COLUMN "public"."awb_status"."awb_visibility" IS '
    10 = INTERNAL
    20 = PUBLIC
';

-- ----------------------------
-- Table structure for awb_status_group
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_status_group";
CREATE TABLE "public"."awb_status_group" (
  "awb_status_group_id" int8 NOT NULL DEFAULT nextval('awb_status_group_awb_status_group_id_seq'::regclass),
  "code" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_status_group" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_status_group_item
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_status_group_item";
CREATE TABLE "public"."awb_status_group_item" (
  "awb_status_group_item_id" int8 NOT NULL DEFAULT nextval('awb_status_group_item_awb_status_group_item_id'::regclass),
  "awb_status_group_id" int4 NOT NULL,
  "awb_status_id" int4 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_status_group_item" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_track
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_track";
CREATE TABLE "public"."awb_track" (
  "awb_track_id" int8 NOT NULL DEFAULT nextval('awb_track_awb_track_id_seq'::regclass),
  "awb_id" int8 NOT NULL,
  "track_json" json NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_track" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_trouble
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_trouble";
CREATE TABLE "public"."awb_trouble" (
    "awb_trouble_id" bigint DEFAULT nextval('public.awb_trouble_awb_trouble_id_seq'::regclass) NOT NULL,
    "awb_trouble_code" character varying(50) NOT NULL,
    "awb_status_id" integer NOT NULL,
    "awb_trouble_status_id" integer NOT NULL,
    "awb_number" character varying(50) NOT NULL,
    "trouble_desc" text,
    "trouble_category" character varying(20),

    "user_id_trigger" bigint,
    "employee_id_trigger" bigint,
    "branch_id_trigger" bigint,

    "user_id_unclear" bigint,
    "employee_id_unclear" bigint,
    "branch_id_unclear" bigint,

    "branch_id_from" bigint,
    "branch_id_wrong" bigint,
    "branch_id_correct" bigint,

    "user_id_pic" bigint,
    "branch_id_pic" bigint,
    "employee_id_pic" bigint,

    "resolve_date_time" timestamp without time zone,
    "description_solution" text,

    "user_id_created" bigint NOT NULL,
    "created_time" timestamp without time zone NOT NULL,
    "user_id_updated" bigint NOT NULL,
    "updated_time" timestamp without time zone NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL
)
;
ALTER TABLE "public"."awb_trouble" OWNER TO "postgres";

-- ----------------------------
-- Table structure for awb_trouble_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."awb_trouble_status";
CREATE TABLE "public"."awb_trouble_status" (
  "awb_trouble_status_id" int4 NOT NULL,
  "awb_trouble_status_code" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "awb_trouble_status_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."awb_trouble_status" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bag
-- ----------------------------
DROP TABLE IF EXISTS "public"."bag";
CREATE TABLE "public"."bag" (
  "bag_id" int8 NOT NULL DEFAULT nextval('bag_bag_id_seq'::regclass),
  "bag_number" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "representative_id_to" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "user_id" int8,
  "branch_id" int8,
  "bag_date" date,
  "bag_date_real" timestamp(6),
  "ref_branch_code" varchar(255) COLLATE "pg_catalog"."default",
  "ref_representative_code" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."bag" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bag_item
-- ----------------------------
DROP TABLE IF EXISTS "public"."bag_item";
CREATE TABLE "public"."bag_item" (
  "bag_item_id" int8 NOT NULL DEFAULT nextval('bag_item_bag_item_id_seq'::regclass),
  "bag_id" int8 NOT NULL,
  "weight" numeric(10,5),
  "bag_seq" int4 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "bag_item_history_id" int8,
  "bagging_id_last" int8
)
;
ALTER TABLE "public"."bag_item" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bag_item_awb
-- ----------------------------
DROP TABLE IF EXISTS "public"."bag_item_awb";
CREATE TABLE "public"."bag_item_awb" (
  "bag_item_awb_id" int8 NOT NULL DEFAULT nextval('bag_item_awb_bag_item_awb_id_seq'::regclass),
  "bag_item_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "awb_number" varchar(255) COLLATE "pg_catalog"."default",
  "weight" numeric(10,5) NOT NULL DEFAULT 0,
  "awb_item_id" int8,
  "send_tracking_note" int4,
  "send_tracking_note_out" int4
)
;
ALTER TABLE "public"."bag_item_awb" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bag_item_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."bag_item_history";
CREATE TABLE "public"."bag_item_history" (
  "bag_item_history_id" int8 NOT NULL DEFAULT nextval('bag_item_history_bag_item_history_id_seq'::regclass),
  "bag_item_id" int8 NOT NULL,
  "user_id" int8,
  "branch_id" int8,
  "bag_item_status_id" int8 NOT NULL,
  "history_date" timestamp(6) NOT NULL,
  "note" text COLLATE "pg_catalog"."default",
  "ref_table" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id" int8,
  "ref_module" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."bag_item_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bag_item_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."bag_item_status";
CREATE TABLE "public"."bag_item_status" (
  "bag_item_status_id" int4 NOT NULL,
  "bag_item_status_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "bag_item_status_title" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "bag_item_status_desc" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."bag_item_status" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bag_solution
-- ----------------------------
DROP TABLE IF EXISTS "public"."bag_solution";
CREATE TABLE "public"."bag_solution" (
  "bag_solution_id" int8 NOT NULL DEFAULT nextval('bag_solution_bag_solution_id_seq'::regclass),
  "bag_item_history_id" int8,
  "bag_trouble_id" int8,
  "bag_solution_desc" text COLLATE "pg_catalog"."default",
  "user_id_created" int8,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."bag_solution" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bag_trouble
-- ----------------------------
DROP TABLE IF EXISTS "public"."bag_trouble";
CREATE TABLE "public"."bag_trouble" (
  "bag_trouble_id" int8 NOT NULL DEFAULT nextval('bag_trouble_bag_trouble_id_seq'::regclass),
  "bag_status_id" int8,
  "bag_number" varchar(255) COLLATE "pg_catalog"."default",
  "resolve_date_time" timestamp(6) NOT NULL,
  "status_resolve_id" int8,
  "employee_id" int8,
  "branch_id" int8,
  "user_id_created" int8,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "description" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."bag_trouble" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bagging
-- ----------------------------
DROP TABLE IF EXISTS "public"."bagging";
CREATE TABLE "public"."bagging" (
  "bagging_id" int8 NOT NULL DEFAULT nextval('bagging_bagging_id_seq'::regclass),
  "bagging_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "branch_id" int8 NOT NULL,
  "user_id" int8 NOT NULL,
  "representative_id_to" int8 NOT NULL,
  "product_code" varchar(255) COLLATE "pg_catalog"."default",
  "bagging_date" date NOT NULL,
  "bagging_date_real" timestamp(6) NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "smu_id_last" int8,
  "bagging_seq" int4 NOT NULL DEFAULT 0,
  "total_item" int4 NOT NULL DEFAULT 0,
  "total_weight" numeric(10,5),
  "smu_item_id_last" int8
)
;
ALTER TABLE "public"."bagging" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bagging_item
-- ----------------------------
DROP TABLE IF EXISTS "public"."bagging_item";
CREATE TABLE "public"."bagging_item" (
  "bagging_item_id" int8 NOT NULL DEFAULT nextval('bagging_item_bagging_item_id_seq'::regclass),
  "bagging_id" int8 NOT NULL,
  "bag_item_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."bagging_item" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bank
-- ----------------------------
DROP TABLE IF EXISTS "public"."bank";
CREATE TABLE "public"."bank" (
  "bank_id" int8 NOT NULL DEFAULT nextval('bank_bank_id_seq'::regclass),
  "bank_code" varchar(255) COLLATE "pg_catalog"."default",
  "bank_name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."bank" OWNER TO "postgres";

-- ----------------------------
-- Table structure for bank_branch
-- ----------------------------
DROP TABLE IF EXISTS "public"."bank_branch";
CREATE TABLE "public"."bank_branch" (
  "bank_branch_id" int8 NOT NULL DEFAULT nextval('bank_branch_bank_branch_id_seq'::regclass),
  "bank_id" int8 NOT NULL,
  "bank_branch_name" varchar(255) COLLATE "pg_catalog"."default",
  "address" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."bank_branch" OWNER TO "postgres";

-- ----------------------------
-- Table structure for branch
-- ----------------------------
DROP TABLE IF EXISTS "public"."branch";
CREATE TABLE "public"."branch" (
  "branch_id" int8 NOT NULL DEFAULT nextval('branch_branch_id_seq'::regclass),
  "branch_id_parent" int8,
  "lft" int4 NOT NULL DEFAULT 0,
  "rgt" int4 NOT NULL DEFAULT 0,
  "depth" int4 NOT NULL DEFAULT 1,
  "priority" int4 NOT NULL DEFAULT 1,
  "branch_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "branch_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "address" varchar(500) COLLATE "pg_catalog"."default",
  "phone1" varchar(255) COLLATE "pg_catalog"."default",
  "phone2" varchar(255) COLLATE "pg_catalog"."default",
  "mobile1" varchar(255) COLLATE "pg_catalog"."default",
  "mobile2" varchar(255) COLLATE "pg_catalog"."default",
  "district_id" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "is_head_office" bool DEFAULT false,
  "representative_id" int8,
  "is_delivery" bool DEFAULT false,
  "is_pickup" bool DEFAULT false,
  "latitude" varchar(500) COLLATE "pg_catalog"."default",
  "longitude" varchar(500) COLLATE "pg_catalog"."default",
  "code_rds" jsonb,
  "branch_type_id" int8
)
;
ALTER TABLE "public"."branch" OWNER TO "postgres";

-- ----------------------------
-- Table structure for branch_region
-- ----------------------------
DROP TABLE IF EXISTS "public"."branch_region";
CREATE TABLE "public"."branch_region" (
  "branch_region_id" int4 NOT NULL DEFAULT nextval('branch_region_branch_region_id_seq'::regclass),
  "branch_id_parent" int8,
  "branch_id_child" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."branch_region" OWNER TO "postgres";

-- ----------------------------
-- Table structure for branch_software
-- ----------------------------
DROP TABLE IF EXISTS "public"."branch_software";
CREATE TABLE "public"."branch_software" (
  "branch_software_id" int8 NOT NULL DEFAULT nextval('branch_software_branch_software_id_seq'::regclass),
  "software_name" varchar(255) COLLATE "pg_catalog"."default",
  "software_version" varchar(255) COLLATE "pg_catalog"."default",
  "branch_code" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "last_online_time" timestamp(6)
)
;
ALTER TABLE "public"."branch_software" OWNER TO "postgres";

-- ----------------------------
-- Table structure for branch_temp
-- ----------------------------
DROP TABLE IF EXISTS "public"."branch_temp";
CREATE TABLE "public"."branch_temp" (
  "id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "address" text COLLATE "pg_catalog"."default",
  "phone" varchar(255) COLLATE "pg_catalog"."default",
  "location" varchar(255) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "hub" varchar(255) COLLATE "pg_catalog"."default",
  "district_id" int8
)
;
ALTER TABLE "public"."branch_temp" OWNER TO "postgres";

-- ----------------------------
-- Table structure for calculation_discount
-- ----------------------------
DROP TABLE IF EXISTS "public"."calculation_discount";
CREATE TABLE "public"."calculation_discount" (
  "calculation_discount_id" int8 NOT NULL DEFAULT nextval('calculation_discount_calculation_discount_id_seq'::regclass),
  "awb_date" timestamp(6),
  "awb_price_id" int8,
  "awb_number" varchar(255) COLLATE "pg_catalog"."default",
  "customer_account_id" int8,
  "status_calculation" int4,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."calculation_discount" OWNER TO "postgres";

-- ----------------------------
-- Table structure for calculation_discount_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."calculation_discount_history";
CREATE TABLE "public"."calculation_discount_history" (
  "calculation_discount_history_id" int8 NOT NULL DEFAULT nextval('calculation_discount_history_calculation_discount_history_id_se'::regclass),
  "calculation_discount_id" int8,
  "awb_number" varchar(255) COLLATE "pg_catalog"."default",
  "price" numeric(20,5) DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."calculation_discount_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for city
-- ----------------------------
DROP TABLE IF EXISTS "public"."city";
CREATE TABLE "public"."city" (
  "city_id" int8 NOT NULL DEFAULT nextval('city_city_id_seq'::regclass),
  "city_type" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "city_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "city_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "country_id" int8 NOT NULL,
  "province_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "city_id_ref_price" int8,
  "city_root" bool DEFAULT false,
  "city_code_backup" varchar(50) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."city" OWNER TO "postgres";

-- ----------------------------
-- Table structure for cms_option
-- ----------------------------
DROP TABLE IF EXISTS "public"."cms_option";
CREATE TABLE "public"."cms_option" (
  "cms_option_id" int8 NOT NULL DEFAULT nextval('cms_option_cms_option_id_seq'::regclass),
  "cms_option_name" varchar(255) COLLATE "pg_catalog"."default",
  "cms_option_value" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."cms_option" OWNER TO "postgres";

-- ----------------------------
-- Table structure for country
-- ----------------------------
DROP TABLE IF EXISTS "public"."country";
CREATE TABLE "public"."country" (
  "country_id" int8 NOT NULL DEFAULT nextval('country_country_id_seq'::regclass),
  "country_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "country_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "country_phone_code" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."country" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer";
CREATE TABLE "public"."customer" (
  "customer_id" int8 NOT NULL DEFAULT nextval('customer_customer_id_seq'::regclass),
  "customer_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "customer_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email1" varchar(200) COLLATE "pg_catalog"."default",
  "email2" varchar(200) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_account
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_account";
CREATE TABLE "public"."customer_account" (
  "customer_account_id" int8 NOT NULL DEFAULT nextval('customer_account_customer_account_id_seq'::regclass),
  "customer_id" int8 NOT NULL,
  "customer_category_id" int8 NOT NULL,
  "customer_grade_id" int8 NOT NULL,
  "customer_account_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "customer_account_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "phone1" varchar(500) COLLATE "pg_catalog"."default",
  "phone2" varchar(500) COLLATE "pg_catalog"."default",
  "mobile1" varchar(500) COLLATE "pg_catalog"."default",
  "mobile2" varchar(500) COLLATE "pg_catalog"."default",
  "email1" varchar(200) COLLATE "pg_catalog"."default",
  "email2" varchar(200) COLLATE "pg_catalog"."default",
  "npwp_number" varchar(255) COLLATE "pg_catalog"."default",
  "pic_customer" varchar(255) COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "join_date" timestamp(6) NOT NULL,
  "term_of_payment_day" int4 NOT NULL,
  "term_of_payment_based_on" varchar(20) COLLATE "pg_catalog"."default",
  "pickup_time_method" varchar(20) COLLATE "pg_catalog"."default",
  "disc_percent" numeric(10,5),
  "disc_value" numeric(20,5),
  "status_customer_account" int4 NOT NULL DEFAULT 1,
  "weight_rounding_const" numeric(10,5) DEFAULT 0,
  "weight_rounding_up_global" numeric(10,5) DEFAULT 0,
  "weight_rounding_up_detail" numeric(10,5) DEFAULT 0,
  "pickup_lead_time_min_days" numeric(10,5) DEFAULT 0,
  "pickup_lead_time_max_days" numeric(10,5) DEFAULT 0,
  "employee_id_sales" int8,
  "employee_id_cro" int8,
  "employee_id_finance" int8,
  "is_sms" bool NOT NULL DEFAULT false,
  "is_email_at_night" bool NOT NULL DEFAULT false,
  "is_confirmation_volume" bool NOT NULL DEFAULT false,
  "is_resi_back" bool NOT NULL DEFAULT false,
  "is_do_back" bool NOT NULL DEFAULT false,
  "is_photo_recipient" bool NOT NULL DEFAULT false,
  "is_photo_ktp" bool NOT NULL DEFAULT false,
  "is_sharia" bool NOT NULL DEFAULT false,
  "is_self_billing" bool NOT NULL DEFAULT false,
  "customer_account_id_billing" int8 NOT NULL DEFAULT 0,
  "billing_reminder" int4 NOT NULL DEFAULT 0,
  "is_cod" bool NOT NULL DEFAULT false,
  "fee_per_receipt" numeric(20,5) DEFAULT 0,
  "percent_cod_value" numeric(10,5) DEFAULT 0,
  "is_land_cargo" bool NOT NULL DEFAULT false,
  "percent_land_cargo_discount" numeric(10,5) DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "weight_rounding_up_global_bool" bool NOT NULL DEFAULT false,
  "weight_rounding_up_detail_bool" bool NOT NULL DEFAULT false,
  "is_force_weight_rounding" bool NOT NULL DEFAULT false,
  "code_rds" jsonb,
  "username" varchar(255) COLLATE "pg_catalog"."default",
  "password" varchar(500) COLLATE "pg_catalog"."default",
  "npwp_attachment_id" int8,
  "disc_jne_percent" numeric(10,5),
  "is_email_lph" bool NOT NULL DEFAULT false,
  "is_input_order_id" bool NOT NULL DEFAULT false,
  "is_load_data_from_internet" bool NOT NULL DEFAULT false,
  "is_promo_3kg" bool,
  "small_code" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."customer_account" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_account_change
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_account_change";
CREATE TABLE "public"."customer_account_change" (
  "customer_account_change_id" int8 NOT NULL DEFAULT nextval('customer_account_change_customer_account_change_id_seq'::regclass),
  "customer_account_id" int8 NOT NULL,
  "customer_account_change_id_ref" int8,
  "effective_date" timestamp(6) NOT NULL,
  "term_of_payment_day" int4 NOT NULL,
  "disc_percent" numeric(10,5) NOT NULL,
  "disc_value" numeric(20,5) NOT NULL,
  "status_customer_account" int4 NOT NULL DEFAULT 1,
  "status_customer_account_change" int4 NOT NULL DEFAULT 10,
  "status_confirm_finance" int4 NOT NULL DEFAULT 0,
  "user_id_confirm_finance" int8,
  "confirm_time_finance" timestamp(6),
  "status_confirm_ops" int4 NOT NULL DEFAULT 0,
  "user_id_confirm_ops" int8,
  "confirm_time_ops" timestamp(6),
  "status_confirm_sales" int4 NOT NULL DEFAULT 0,
  "user_id_confirm_sales" int8,
  "confirm_time_sales" timestamp(6),
  "employee_id_cro" int8,
  "is_cod" bool NOT NULL DEFAULT false,
  "fee_per_receipt" numeric(20,5) DEFAULT 0,
  "percent_cod_value" numeric(10,5) DEFAULT 0,
  "is_land_cargo" bool NOT NULL DEFAULT false,
  "percent_land_cargo_discount" numeric(10,5) DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "customer_category_id" int8,
  "note" text COLLATE "pg_catalog"."default",
  "disc_jne_percent" numeric(10,5)
)
;
ALTER TABLE "public"."customer_account_change" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_account_merchant
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_account_merchant";
CREATE TABLE "public"."customer_account_merchant" (
  "customer_account_merchant_id" int8 NOT NULL DEFAULT nextval('customer_account_merchant_customer_account_merchant_id_seq'::regclass),
  "customer_account_merchant_code" varchar(255) COLLATE "pg_catalog"."default",
  "customer_account_id_parent" int8 NOT NULL,
  "customer_account_id_child" int8 NOT NULL,
  "is_cashless" bool NOT NULL DEFAULT false,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_account_merchant" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_account_post_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_account_post_history";
CREATE TABLE "public"."customer_account_post_history" (
  "customer_account_post_history_id" int8 NOT NULL DEFAULT nextval('customer_account_post_history_customer_account_post_history_id_'::regclass),
  "awb_history_id" int8 NOT NULL,
  "awb_id" int8,
  "awb_detail_id" int8,
  "user_id" int8,
  "branch_id" int8,
  "history_date" timestamp(6) NOT NULL,
  "awb_status_id" int8,
  "awb_note" text COLLATE "pg_catalog"."default",
  "customer_account_id" int8,
  "ref_id_tracking_note" int8,
  "ref_id_tracking_site" int8,
  "ref_id_cust_package" varchar(255) COLLATE "pg_catalog"."default",
  "ref_awb_number" varchar(50) COLLATE "pg_catalog"."default",
  "ref_tracking_site_code" varchar(255) COLLATE "pg_catalog"."default",
  "ref_tracking_site_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_partner_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_recipient_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id_courier" int8,
  "ref_courier_name" varchar(255) COLLATE "pg_catalog"."default",
  "ref_tracking_type" varchar(255) COLLATE "pg_catalog"."default",
  "ref_user_created" varchar(255) COLLATE "pg_catalog"."default",
  "ref_user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "request_body" text COLLATE "pg_catalog"."default",
  "status_post" int4 DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "response_body" text COLLATE "pg_catalog"."default",
  "post_history_code" varchar(500) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying
)
;
ALTER TABLE "public"."customer_account_post_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_address
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_address";
CREATE TABLE "public"."customer_address" (
  "customer_address_id" int8 NOT NULL DEFAULT nextval('customer_address_customer_address_id_seq'::regclass),
  "customer_account_id" int8,
  "district_id" int8,
  "address" text COLLATE "pg_catalog"."default" NOT NULL,
  "zip_code" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 0,
  "is_pickup" bool NOT NULL DEFAULT false,
  "is_billing" bool NOT NULL DEFAULT false,
  "is_cust_address" bool NOT NULL DEFAULT false,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "latitude" varchar(500) COLLATE "pg_catalog"."default",
  "longitude" varchar(500) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."customer_address" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_bank
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_bank";
CREATE TABLE "public"."customer_bank" (
  "customer_bank_id" int8 NOT NULL DEFAULT nextval('customer_bank_customer_bank_id_seq'::regclass),
  "customer_account_id" int8,
  "bank_branch_id" int8,
  "account_number" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "account_name" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_bank" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_bank_change
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_bank_change";
CREATE TABLE "public"."customer_bank_change" (
  "customer_bank_change_id" int8 NOT NULL DEFAULT nextval('customer_bank_change_customer_bank_change_id_seq'::regclass),
  "customer_account_change_id" int8,
  "bank_branch_id" int8,
  "account_number" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "account_name" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_bank_change" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_category
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_category";
CREATE TABLE "public"."customer_category" (
  "customer_category_id" int8 NOT NULL DEFAULT nextval('customer_category_customer_category_id_seq'::regclass),
  "customer_category_id_parent" int8,
  "lft" int4 NOT NULL,
  "rgt" int4 NOT NULL,
  "depth" int4 NOT NULL,
  "priority" int4 NOT NULL DEFAULT 1,
  "customer_category_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "customer_category_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_category" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_grade
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_grade";
CREATE TABLE "public"."customer_grade" (
  "customer_grade_id" int8 NOT NULL DEFAULT nextval('customer_grade_customer_grade_id_seq'::regclass),
  "grade_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "revenue_from" numeric(20,5) NOT NULL DEFAULT 0,
  "revenue_to" numeric(20,5) NOT NULL DEFAULT 0,
  "disc_percent" numeric(10,5) NOT NULL DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_grade" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_meta
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_meta";
CREATE TABLE "public"."customer_meta" (
  "customer_meta_id" int8 NOT NULL DEFAULT nextval('customer_meta_customer_meta_id_seq'::regclass),
  "customer_account_id" int8,
  "meta_key" varchar(255) COLLATE "pg_catalog"."default",
  "meta_value" text COLLATE "pg_catalog"."default",
  "meta_type" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "meta_level" varchar(25) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."customer_meta" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_meta_change
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_meta_change";
CREATE TABLE "public"."customer_meta_change" (
  "customer_meta_change_id" int8 NOT NULL DEFAULT nextval('customer_meta_change_customer_meta_change_id_seq'::regclass),
  "customer_account_change_id" int8,
  "meta_key" varchar(255) COLLATE "pg_catalog"."default",
  "meta_value" text COLLATE "pg_catalog"."default",
  "meta_type" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_meta_change" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_pickup
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_pickup";
CREATE TABLE "public"."customer_pickup" (
  "customer_pickup_id" int8 NOT NULL DEFAULT nextval('customer_pickup_customer_pickup_id_seq'::regclass),
  "customer_id" int8,
  "district_id" int8,
  "address" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_pickup" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_setting
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_setting";
CREATE TABLE "public"."customer_setting" (
  "customer_setting_id" int8 NOT NULL DEFAULT nextval('customer_setting_customer_setting_id_seq'::regclass),
  "customer_account_id" int8 NOT NULL,
  "billing_print_type" varchar(10) COLLATE "pg_catalog"."default",
  "end_of_month" bool,
  "reminder_reconcile" int4 NOT NULL DEFAULT 7,
  "send_email" bool,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_setting" OWNER TO "postgres";

-- ----------------------------
-- Table structure for customer_setting_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."customer_setting_detail";
CREATE TABLE "public"."customer_setting_detail" (
  "customer_setting_detail_id" int8 NOT NULL DEFAULT nextval('customer_setting_detail_customer_setting_detail_id_seq'::regclass),
  "customer_setting_id" int8 NOT NULL,
  "day_number" int4,
  "date_number" int4,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."customer_setting_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS "public"."department";
CREATE TABLE "public"."department" (
  "department_id" int8 NOT NULL DEFAULT nextval('department_department_id_seq'::regclass),
  "department_id_parent" int8,
  "lft" int4 NOT NULL,
  "rgt" int4 NOT NULL,
  "depth" int4 NOT NULL,
  "priority" int4 NOT NULL DEFAULT 1,
  "department_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "department_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."department" OWNER TO "postgres";

-- ----------------------------
-- Table structure for detail_email_at_night
-- ----------------------------
DROP TABLE IF EXISTS "public"."detail_email_at_night";
CREATE TABLE "public"."detail_email_at_night" (
  "detail_email_at_night_id" int8 NOT NULL DEFAULT nextval('detail_email_at_night_detail_email_at_night_id_seq'::regclass),
  "email_at_night_id" int8,
  "customer_account_id" int8,
  "pdf_url" varchar(500) COLLATE "pg_catalog"."default",
  "status_email" varchar(1) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."detail_email_at_night" OWNER TO "postgres";

-- ----------------------------
-- Table structure for detail_lph
-- ----------------------------
DROP TABLE IF EXISTS "public"."detail_lph";
CREATE TABLE "public"."detail_lph" (
  "detail_lph_id" int8 NOT NULL DEFAULT nextval('detail_lph_detail_lph_id_seq'::regclass),
  "lph_id" int8,
  "customer_account_id" int8,
  "pdf_url" varchar(500) COLLATE "pg_catalog"."default",
  "status_email" varchar(1) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."detail_lph" OWNER TO "postgres";

-- ----------------------------
-- Table structure for district
-- ----------------------------
DROP TABLE IF EXISTS "public"."district";
CREATE TABLE "public"."district" (
  "district_id" int8 NOT NULL DEFAULT nextval('district_district_id_seq'::regclass),
  "country_id" int8 NOT NULL,
  "province_id" int8 NOT NULL,
  "city_id" int8 NOT NULL,
  "district_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "district_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "zone_id" int8 NOT NULL,
  "district_id_ref_price" int8,
  "notes" text COLLATE "pg_catalog"."default",
  "zip_code" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "branch_id_delivery" int8,
  "branch_id_pickup" int8
)
;
ALTER TABLE "public"."district" OWNER TO "postgres";

-- ----------------------------
-- Table structure for district_reference
-- ----------------------------
DROP TABLE IF EXISTS "public"."district_reference";
CREATE TABLE "public"."district_reference" (
  "district_reference_id" int8 NOT NULL DEFAULT nextval('district_reference_district_reference_id_seq'::regclass),
  "district_id" int8 NOT NULL,
  "ref_owner" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "ref_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."district_reference" OWNER TO "postgres";

-- ----------------------------
-- Table structure for division
-- ----------------------------
DROP TABLE IF EXISTS "public"."division";
CREATE TABLE "public"."division" (
  "division_id" int8 NOT NULL DEFAULT nextval('division_division_id_seq'::regclass),
  "division_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "division_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "branch_id" int8
)
;
ALTER TABLE "public"."division" OWNER TO "postgres";

-- ----------------------------
-- Table structure for division_department
-- ----------------------------
DROP TABLE IF EXISTS "public"."division_department";
CREATE TABLE "public"."division_department" (
  "division_department_id" int8 NOT NULL DEFAULT nextval('division_department_id_seq'::regclass),
  "branch_id" int8 NOT NULL,
  "division_id" int8 NOT NULL,
  "department_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."division_department" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pickup
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pickup";
CREATE TABLE "public"."do_pickup" (
  "do_pickup_id" int8 NOT NULL DEFAULT nextval('do_pickup_do_pickup_id_seq'::regclass),
  "do_pickup_date" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "employee_id" int8 NOT NULL,
  "work_order_group" varchar(500) COLLATE "pg_catalog"."default",
  "work_order_group_encrypt" varchar(500) COLLATE "pg_catalog"."default",
  "latitude_check_in" varchar(100) COLLATE "pg_catalog"."default",
  "latitude_check_out" varchar(100) COLLATE "pg_catalog"."default",
  "longitude_check_in" varchar(100) COLLATE "pg_catalog"."default",
  "longitude_check_out" varchar(100) COLLATE "pg_catalog"."default",
  "check_in_date_time" timestamp(6),
  "check_out_date_time" timestamp(6),
  "cancel_check_in_date_time" timestamp(6),
  "cancel_check_out_date_time" timestamp(6),
  "is_active" bool DEFAULT false,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "customer_account_id" int8,
  "merchant_name" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_image" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_signature" varchar(255) COLLATE "pg_catalog"."default",
  "total_item" int4,
  "do_pickup_type" int4,
  "attachment_id_image" jsonb
)
;
ALTER TABLE "public"."do_pickup" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pickup_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pickup_detail";
CREATE TABLE "public"."do_pickup_detail" (
  "do_pickup_detail_id" int8 NOT NULL DEFAULT nextval('do_pickup_detail_do_pickup_detail_id_seq'::regclass),
  "do_pickup_id" int8 NOT NULL,
  "work_order_id" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_pickup_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pod
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pod";
CREATE TABLE "public"."do_pod" (
  "do_pod_id" int8 NOT NULL DEFAULT nextval('do_pod_do_pod_id_seq'::regclass),
  "do_pod_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "ref_do_pod_code" varchar(255) COLLATE "pg_catalog"."default",
  "do_pod_date_time" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "branch_id_to" int8,
  "total_assigned" int4,
  "user_id_driver" int8,
  "employee_id_driver" int8,
  "latitude_last" varchar(100) COLLATE "pg_catalog"."default",
  "longitude_last" varchar(100) COLLATE "pg_catalog"."default",
  "total_item" int4 NOT NULL DEFAULT 0,
  "total_pod_item" int4 NOT NULL DEFAULT 0,
  "total_weight" numeric(20,5) NOT NULL DEFAULT 0,
  "do_pod_status_id_last" int8,
  "do_pod_history_id_last" int8,
  "history_date_time_last" timestamp(6),
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "do_pod_type" int4,
  "third_party_id" int4,
  "partner_logistic_id" int8,
  "do_pod_method" int8,
  "vehicle_number" varchar(100) COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "total_scan_in" int4,
  "total_scan_out" int4,
  "percen_scan_in_out" int4,
  "last_date_scan_in" timestamp(6),
  "last_date_scan_out" timestamp(6),
  "first_date_scan_out" timestamp(6),
  "first_date_scan_in" timestamp(6),
  "total_weight_final" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_final_rounded" numeric(20,5) NOT NULL DEFAULT 0
)
;
ALTER TABLE "public"."do_pod" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pod_deliver
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pod_deliver";
CREATE TABLE "public"."do_pod_deliver" (
  "do_pod_deliver_id" int8 NOT NULL DEFAULT nextval('do_pod_deliver_do_pod_deliver_id_seq'::regclass),
  "do_pod_deliver_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "ref_do_pod_deliver_code" varchar(255) COLLATE "pg_catalog"."default",
  "do_pod_deliver_date_time" timestamp(6) NOT NULL,
  "total_awb" int4,
  "employee_id_driver" int8,
  "description" text COLLATE "pg_catalog"."default",
  "user_id" int8,
  "branch_id" int8,
  "total_delivery" int4 NOT NULL DEFAULT 0,
  "total_problem" int4 NOT NULL DEFAULT 0,
  "user_id_created" int8,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_pod_deliver" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pod_deliver_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pod_deliver_detail";
CREATE TABLE "public"."do_pod_deliver_detail" (
  "do_pod_deliver_detail_id" int8 NOT NULL DEFAULT nextval('do_pod_deliver_detail_do_pod_deliver_detail_id_seq'::regclass),
  "do_pod_deliver_id" int8 NOT NULL,
  "awb_item_id" int8,
  "awb_status_id_last" int8,
  "reason_id_last" int8,
  "awb_status_date_time_last" timestamp(6),
  "sync_date_time_last" timestamp(6),
  "longitude_delivery_last" varchar(255) COLLATE "pg_catalog"."default",
  "latitude_delivery_last" varchar(255) COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_pod_deliver_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pod_deliver_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pod_deliver_history";
CREATE TABLE "public"."do_pod_deliver_history" (
  "do_pod_deliver_history_id" int8 NOT NULL DEFAULT nextval('do_pod_deliver_history_do_pod_deliver_history_id_seq'::regclass),
  "do_pod_deliver_detail_id" int8 NOT NULL,
  "awb_status_id" int8,
  "reason_id" int8,
  "awb_status_date_time" timestamp(6),
  "sync_date_time" timestamp(6),
  "longitude_delivery" varchar(255) COLLATE "pg_catalog"."default",
  "latitude_delivery" varchar(255) COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_pod_deliver_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pod_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pod_detail";
CREATE TABLE "public"."do_pod_detail" (
  "do_pod_detail_id" int8 NOT NULL DEFAULT nextval('do_pod_detail_do_pod_detail_id_seq'::regclass),
  "do_pod_id" int8 NOT NULL,
  "pod_scan_in_id" int8,
  "awb_item_id" int8,
  "bag_item_id" int8,
  "do_pod_status_id_last" int8 NOT NULL,
  "do_pod_history_id_last" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "is_scan_out" bool DEFAULT false,
  "scan_out_type" varchar(50) COLLATE "pg_catalog"."default",
  "is_scan_in" bool DEFAULT false,
  "scan_in_type" varchar(50) COLLATE "pg_catalog"."default",
  "employee_journey_id_in" int8,
  "employee_journey_id_out" int8,
  "is_posted" int4,
  "total_weight_final" numeric(20,5) NOT NULL DEFAULT 0,
  "total_weight_final_rounded" numeric(20,5) NOT NULL DEFAULT 0
)
;
ALTER TABLE "public"."do_pod_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pod_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pod_history";
CREATE TABLE "public"."do_pod_history" (
  "do_pod_history_id" int8 NOT NULL DEFAULT nextval('do_pod_history_do_pod_history_id_seq'::regclass),
  "do_pod_id" int8 NOT NULL,
  "do_pod_date_time" timestamp(6),
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "is_member" bool,
  "customer_account_id" int8,
  "customer_account_merchant_id" int8,
  "total_assigned" int4,
  "employee_id_driver" int8,
  "user_id_driver" int8,
  "latitude" varchar(100) COLLATE "pg_catalog"."default",
  "longitude" varchar(100) COLLATE "pg_catalog"."default",
  "consignee_name" varchar(255) COLLATE "pg_catalog"."default",
  "received_date_time" timestamp(6),
  "total_weight" numeric(20,5) NOT NULL DEFAULT 0,
  "history_notes" text COLLATE "pg_catalog"."default",
  "reason_id" int8,
  "do_pod_status_id" int8 NOT NULL,
  "history_date_time" timestamp(6) NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "do_pod_detail_id" int8,
  "branch_id_to" int8,
  "third_party_id" int4
)
;
ALTER TABLE "public"."do_pod_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_pod_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_pod_status";
CREATE TABLE "public"."do_pod_status" (
  "do_pod_status_id" int8 NOT NULL DEFAULT nextval('do_pod_status_do_pod_status_id_seq'::regclass),
  "status_code" varchar(255) COLLATE "pg_catalog"."default",
  "status_title" varchar(255) COLLATE "pg_catalog"."default",
  "status_name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_pod_status" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_smu
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_smu";
CREATE TABLE "public"."do_smu" (
  "do_smu_id" int8 NOT NULL DEFAULT nextval('do_smu_do_smu_id_seq'::regclass),
  "do_smu_id_parent" int8,
  "do_smu_type" int4 NOT NULL DEFAULT 10,
  "do_smu_code" varchar(255) COLLATE "pg_catalog"."default",
  "do_smu_time" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "employee_id_driver" int8 NOT NULL,
  "vehicle_number" varchar(255) COLLATE "pg_catalog"."default",
  "vehicle_city_label" varchar(255) COLLATE "pg_catalog"."default",
  "scan_vehicle" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "scan_driver" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "attachment_tms_id_airport_receipt" int8,
  "airport_receipt_amount" numeric(10,5) NOT NULL DEFAULT 0,
  "do_smu_history_id" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "total_item" int4 NOT NULL DEFAULT 0,
  "total_weight" numeric(10,5),
  "vehicle_branch_scan" varchar(500) COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "public"."do_smu" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_smu_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_smu_detail";
CREATE TABLE "public"."do_smu_detail" (
  "do_smu_detail_id" int8 NOT NULL DEFAULT nextval('do_smu_detail_do_smu_detail_id_seq'::regclass),
  "do_smu_id" int8 NOT NULL,
  "smu_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "note" text COLLATE "pg_catalog"."default",
  "attachment_tms_id_smu_pic" jsonb,
  "smu_item_id" int8 NOT NULL DEFAULT 0
)
;
ALTER TABLE "public"."do_smu_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_smu_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_smu_history";
CREATE TABLE "public"."do_smu_history" (
  "do_smu_history_id" int8 NOT NULL DEFAULT nextval('do_smu_history_do_smu_history_id_seq'::regclass),
  "do_smu_id" int8 NOT NULL,
  "do_smu_detail_id" int8,
  "do_smu_time" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "employee_id_driver" int8,
  "latitude" varchar(500) COLLATE "pg_catalog"."default",
  "longitude" varchar(500) COLLATE "pg_catalog"."default",
  "do_smu_status_id" int4 NOT NULL DEFAULT 1000,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_smu_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_smu_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_smu_status";
CREATE TABLE "public"."do_smu_status" (
  "do_smu_status_id" int4 NOT NULL,
  "do_smu_status_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "do_smu_status_title" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "do_smu_status_desc" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_smu_status" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_work_order
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_work_order";
CREATE TABLE "public"."do_work_order" (
  "do_work_order_id" int8 NOT NULL DEFAULT nextval('do_work_order_do_work_order_id_seq'::regclass),
  "do_work_order_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "do_work_order_date" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "branch_id_to" int8 NOT NULL,
  "total_work_order" int4,
  "total_item" int4,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "item_type" int4 DEFAULT 0
)
;
ALTER TABLE "public"."do_work_order" OWNER TO "postgres";

-- ----------------------------
-- Table structure for do_work_order_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."do_work_order_detail";
CREATE TABLE "public"."do_work_order_detail" (
  "do_work_order_detail_id" int8 NOT NULL DEFAULT nextval('do_work_order_detail_do_work_order_detail_id_seq'::regclass),
  "do_work_order_id" int8 NOT NULL,
  "work_order_id" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."do_work_order_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for email_at_night
-- ----------------------------
DROP TABLE IF EXISTS "public"."email_at_night";
CREATE TABLE "public"."email_at_night" (
  "email_at_night_id" int8 NOT NULL DEFAULT nextval('email_at_night_email_at_night_id_seq'::regclass),
  "awb_date" timestamp(6) NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."email_at_night" OWNER TO "postgres";

-- ----------------------------
-- Table structure for email_log
-- ----------------------------
DROP TABLE IF EXISTS "public"."email_log";
CREATE TABLE "public"."email_log" (
  "email_log_id" int8 NOT NULL DEFAULT nextval('email_log_email_log_id_seq'::regclass),
  "email_type" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id" varchar(255) COLLATE "pg_catalog"."default",
  "options" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."email_log" OWNER TO "postgres";

-- ----------------------------
-- Table structure for email_log_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."email_log_history";
CREATE TABLE "public"."email_log_history" (
  "email_log_history_id" int8 NOT NULL DEFAULT nextval('email_log_history_email_log_history_id_seq'::regclass),
  "email_log_id" int8 NOT NULL,
  "ref_table" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id" int8,
  "email_subject" text COLLATE "pg_catalog"."default",
  "email_to" text COLLATE "pg_catalog"."default",
  "email_cc" text COLLATE "pg_catalog"."default",
  "email_bcc" text COLLATE "pg_catalog"."default",
  "html_body" text COLLATE "pg_catalog"."default",
  "email_sent" bool NOT NULL DEFAULT false,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."email_log_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee";
CREATE TABLE "public"."employee" (
  "employee_id" int8 NOT NULL DEFAULT nextval('employee_employee_id_seq'::regclass),
  "employee_type_id" int8,
  "employee_role_id" int8,
  "department_id" int8,
  "attachment_id" int8,
  "nik" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fullname" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nickname" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email1" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "email2" varchar(500) COLLATE "pg_catalog"."default",
  "phone1" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "phone2" varchar(100) COLLATE "pg_catalog"."default",
  "mobile1" varchar(100) COLLATE "pg_catalog"."default",
  "mobile2" varchar(100) COLLATE "pg_catalog"."default",
  "district_id_home" int8,
  "home_address" text COLLATE "pg_catalog"."default",
  "zip_code_home" varchar(50) COLLATE "pg_catalog"."default",
  "district_id_id_card" int8,
  "id_card_address" text COLLATE "pg_catalog"."default",
  "zip_code_id_card" varchar(50) COLLATE "pg_catalog"."default",
  "date_of_entry" timestamp(6) NOT NULL,
  "date_of_resign" timestamp(6),
  "employee_id_manager" int8,
  "employee_id_coach" int8,
  "is_manager" bool NOT NULL DEFAULT false,
  "country_id_nationality" int8,
  "identification_number" varchar(100) COLLATE "pg_catalog"."default",
  "driver_license_a" varchar(100) COLLATE "pg_catalog"."default",
  "driver_license_c" varchar(100) COLLATE "pg_catalog"."default",
  "passport_number" varchar(100) COLLATE "pg_catalog"."default",
  "npwp_number" varchar(100) COLLATE "pg_catalog"."default",
  "religion" varchar(50) COLLATE "pg_catalog"."default",
  "gender" varchar(50) COLLATE "pg_catalog"."default",
  "marital_status" varchar(50) COLLATE "pg_catalog"."default",
  "number_of_child" int4,
  "birthdate" timestamp(6),
  "place_of_birth" varchar(200) COLLATE "pg_catalog"."default",
  "cod_position" varchar(50) COLLATE "pg_catalog"."default",
  "bank_id_account" int8,
  "bank_account_number" varchar(100) COLLATE "pg_catalog"."default",
  "bank_account_name" varchar(100) COLLATE "pg_catalog"."default",
  "status_employee" int4 NOT NULL DEFAULT 10,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "branch_id" int8,
  "division_id" int8,
  "is_people" bool DEFAULT false,
  "allow_pick_office" bool DEFAULT false
)
;
ALTER TABLE "public"."employee" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee_education
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee_education";
CREATE TABLE "public"."employee_education" (
  "employee_education_id" int8 NOT NULL DEFAULT nextval('employee_education_employee_education_id_seq'::regclass),
  "employee_id" int8 NOT NULL,
  "education" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "education_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "majors" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "education_start" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "education_end" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."employee_education" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee_experience
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee_experience";
CREATE TABLE "public"."employee_experience" (
  "employee_experience_id" int8 NOT NULL DEFAULT nextval('employee_experience_employee_experience_id_seq'::regclass),
  "employee_id" int8 NOT NULL,
  "company" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "company_description" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "position" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "experience_start" varchar(255) COLLATE "pg_catalog"."default",
  "experience_end" varchar(255) COLLATE "pg_catalog"."default",
  "last_salary" numeric(10,2) DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."employee_experience" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee_family
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee_family";
CREATE TABLE "public"."employee_family" (
  "employee_family_id" int8 NOT NULL DEFAULT nextval('employee_family_employee_family_id_seq'::regclass),
  "employee_id" int8 NOT NULL,
  "full_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "status" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "gender" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "last_education" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."employee_family" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee_journey
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee_journey";
CREATE TABLE "public"."employee_journey" (
  "employee_journey_id" int8 NOT NULL DEFAULT nextval('employee_journey_employee_journey_id_seq'::regclass),
  "employee_id" int8,
  "check_in_date" timestamp(6) NOT NULL,
  "check_out_date" timestamp(6),
  "longitude_check_in" varchar(100) COLLATE "pg_catalog"."default",
  "latitude_check_in" varchar(100) COLLATE "pg_catalog"."default",
  "longitude_check_out" varchar(100) COLLATE "pg_catalog"."default",
  "latitude_check_out" varchar(100) COLLATE "pg_catalog"."default",
  "user_id_created" int8,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."employee_journey" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee_role
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee_role";
CREATE TABLE "public"."employee_role" (
  "employee_role_id" int8 NOT NULL DEFAULT nextval('employee_role_employee_role_id_seq'::regclass),
  "employee_role_id_parent" int8,
  "lft" int4 NOT NULL DEFAULT 0,
  "rgt" int4 NOT NULL DEFAULT 0,
  "depth" int4 NOT NULL DEFAULT 1,
  "priority" int4 NOT NULL DEFAULT 1,
  "employee_role_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "employee_role_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "employee_level" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "employee_position" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."employee_role" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee_source
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee_source";
CREATE TABLE "public"."employee_source" (
  "employee_source_id" int8 NOT NULL DEFAULT nextval('employee_source_employee_source_id_seq'::regclass),
  "employee_id" int8 NOT NULL,
  "source" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."employee_source" OWNER TO "postgres";

-- ----------------------------
-- Table structure for employee_type
-- ----------------------------
DROP TABLE IF EXISTS "public"."employee_type";
CREATE TABLE "public"."employee_type" (
  "employee_type_id" int8 NOT NULL DEFAULT nextval('employee_type_employee_type_id_seq'::regclass),
  "employee_type_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "employee_type_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."employee_type" OWNER TO "postgres";

-- ----------------------------
-- Table structure for industry_type
-- ----------------------------
DROP TABLE IF EXISTS "public"."industry_type";
CREATE TABLE "public"."industry_type" (
  "industry_type_id" int8 NOT NULL DEFAULT nextval('industry_type_industry_type_id_seq'::regclass),
  "industry_type_code" varchar(255) COLLATE "pg_catalog"."default",
  "industry_type_name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."industry_type" OWNER TO "postgres";

-- ----------------------------
-- Table structure for invoice
-- ----------------------------
DROP TABLE IF EXISTS "public"."invoice";
CREATE TABLE "public"."invoice" (
  "invoice_id" int8 NOT NULL DEFAULT nextval('invoice_invoice_id_seq'::regclass),
  "invoice_id_parent" int8,
  "invoice_code" int4,
  "invoice_seq" int4,
  "invoice_date" timestamp(6),
  "awb_start_date" timestamp(6),
  "awb_end_date" timestamp(6),
  "reminder_date" timestamp(6),
  "customer_account_id" int8,
  "email" varchar(100) COLLATE "pg_catalog"."default",
  "amount" numeric(20,5) DEFAULT 0,
  "weight" numeric(20,5) DEFAULT 0,
  "total_awb" numeric(20,5) DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."invoice" OWNER TO "postgres";

-- ----------------------------
-- Table structure for invoice_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."invoice_detail";
CREATE TABLE "public"."invoice_detail" (
  "invoice_detail_id" int8 NOT NULL DEFAULT nextval('invoice_detail_invoice_detail_id_seq'::regclass),
  "invoice_id" int8,
  "type" varchar(255) COLLATE "pg_catalog"."default",
  "awb_price_id" int8,
  "invoice_date" timestamp(6),
  "amount" numeric(20,5) DEFAULT 0,
  "component_name" varchar(255) COLLATE "pg_catalog"."default",
  "component_desc" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."invoice_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for items
-- ----------------------------
DROP TABLE IF EXISTS "public"."items";
CREATE TABLE "public"."items" (
  "id" int8 NOT NULL DEFAULT nextval('items_id_seq'::regclass),
  "name" varchar COLLATE "pg_catalog"."default",
  "done" bool,
  "todo_id" int8,
  "created_at" timestamp(6) NOT NULL,
  "updated_at" timestamp(6) NOT NULL
)
;
ALTER TABLE "public"."items" OWNER TO "postgres";

-- ----------------------------
-- Table structure for location
-- ----------------------------
DROP TABLE IF EXISTS "public"."location";
CREATE TABLE "public"."location" (
  "code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "province" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "city" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "district" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "city_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "zone" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "city_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "toped_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "notes" text COLLATE "pg_catalog"."default" NOT NULL,
  "representative" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "province_id" int8,
  "zone_id" int8,
  "city_id" int8,
  "representative_id" int8,
  "district_id" int8,
  "city_type" varchar(50) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."location" OWNER TO "postgres";

-- ----------------------------
-- Table structure for log_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."log_history";
CREATE TABLE "public"."log_history" (
  "log_history_id" int8 NOT NULL DEFAULT nextval('log_history_log_history_id_seq'::regclass),
  "table_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "reference_id" int8 NOT NULL,
  "field_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "value_before" text COLLATE "pg_catalog"."default",
  "value_after" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."log_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for log_login
-- ----------------------------
DROP TABLE IF EXISTS "public"."log_login";
CREATE TABLE "public"."log_login" (
  "log_login_id" int8 NOT NULL DEFAULT nextval('log_login_log_login_id_seq'::regclass),
  "username" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default",
  "session_id" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "error_message" varchar(500) COLLATE "pg_catalog"."default",
  "remote_addr" varchar(255) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "platform_version" varchar(255) COLLATE "pg_catalog"."default",
  "platform" varchar(255) COLLATE "pg_catalog"."default",
  "browser_version" varchar(255) COLLATE "pg_catalog"."default",
  "browser" varchar(255) COLLATE "pg_catalog"."default",
  "login_date" timestamp(6),
  "login_fail_date" timestamp(6),
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."log_login" OWNER TO "postgres";

-- ----------------------------
-- Table structure for log_login_fail
-- ----------------------------
DROP TABLE IF EXISTS "public"."log_login_fail";
CREATE TABLE "public"."log_login_fail" (
  "log_login_fail_id" int8 NOT NULL DEFAULT nextval('log_login_fail_log_login_fail_id_seq'::regclass),
  "username" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default",
  "session_id" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "error_message" varchar(500) COLLATE "pg_catalog"."default",
  "remote_addr" varchar(255) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "platform_version" varchar(255) COLLATE "pg_catalog"."default",
  "platform" varchar(255) COLLATE "pg_catalog"."default",
  "browser_version" varchar(255) COLLATE "pg_catalog"."default",
  "browser" varchar(255) COLLATE "pg_catalog"."default",
  "login_date" timestamp(6),
  "login_fail_date" timestamp(6),
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."log_login_fail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for lph
-- ----------------------------
DROP TABLE IF EXISTS "public"."lph";
CREATE TABLE "public"."lph" (
  "lph_id" int8 NOT NULL DEFAULT nextval('lph_lph_id_seq'::regclass),
  "awb_date" timestamp(6) NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "is_jne" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."lph" OWNER TO "postgres";

-- ----------------------------
-- Table structure for menu
-- ----------------------------
DROP TABLE IF EXISTS "public"."menu";
CREATE TABLE "public"."menu" (
  "menu_id" int8 NOT NULL DEFAULT nextval('menu_menu_id_seq'::regclass),
  "menu_code" varchar(255) COLLATE "pg_catalog"."default",
  "menu_name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "directory" varchar(255) COLLATE "pg_catalog"."default",
  "controller" varchar(255) COLLATE "pg_catalog"."default",
  "method" varchar(255) COLLATE "pg_catalog"."default",
  "label" varchar(255) COLLATE "pg_catalog"."default",
  "icon" varchar(255) COLLATE "pg_catalog"."default",
  "link" varchar(255) COLLATE "pg_catalog"."default",
  "menu_id_parent" int8,
  "lft" int4,
  "rgt" int4,
  "depth" int4,
  "priority" int4
)
;
ALTER TABLE "public"."menu" OWNER TO "postgres";

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS "public"."migrations";
CREATE TABLE "public"."migrations" (
  "id" int4 NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
  "timestamp" int8 NOT NULL,
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "public"."migrations" OWNER TO "postgres";

-- ----------------------------
-- Table structure for notification_msg
-- ----------------------------
DROP TABLE IF EXISTS "public"."notification_msg";
CREATE TABLE "public"."notification_msg" (
  "notification_msg_id" int8 NOT NULL DEFAULT nextval('notification_msg_notification_msg_id_seq'::regclass),
  "title" varchar(500) COLLATE "pg_catalog"."default",
  "message" text COLLATE "pg_catalog"."default",
  "attachment_id" int8,
  "module" varchar(255) COLLATE "pg_catalog"."default",
  "ref_table" varchar(255) COLLATE "pg_catalog"."default",
  "ref_id" int8,
  "response_message" text COLLATE "pg_catalog"."default",
  "multicast_id" varchar(500) COLLATE "pg_catalog"."default",
  "success" text COLLATE "pg_catalog"."default",
  "failure" text COLLATE "pg_catalog"."default",
  "canonical_ids" varchar(500) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "options" json
)
;
ALTER TABLE "public"."notification_msg" OWNER TO "postgres";

-- ----------------------------
-- Table structure for notification_token
-- ----------------------------
DROP TABLE IF EXISTS "public"."notification_token";
CREATE TABLE "public"."notification_token" (
  "notification_token_id" int8 NOT NULL DEFAULT nextval('notification_token_notification_token_id_seq'::regclass),
  "user_id" int8,
  "token" varchar(600) COLLATE "pg_catalog"."default" NOT NULL,
  "imei" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "branch_id" int8,
  "ip_address_v4" varchar(255) COLLATE "pg_catalog"."default",
  "ip_address_v6" varchar(255) COLLATE "pg_catalog"."default",
  "device_version" varchar(255) COLLATE "pg_catalog"."default",
  "device_name" varchar(255) COLLATE "pg_catalog"."default",
  "device_os" varchar(255) COLLATE "pg_catalog"."default",
  "mac_address_eth0" varchar(255) COLLATE "pg_catalog"."default",
  "mac_address_wlan0" varchar(255) COLLATE "pg_catalog"."default",
  "apps_version" varchar(255) COLLATE "pg_catalog"."default",
  "apps_version_release" varchar(255) COLLATE "pg_catalog"."default",
  "connectivity_status" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."notification_token" OWNER TO "postgres";

-- ----------------------------
-- Table structure for origin_temp
-- ----------------------------
DROP TABLE IF EXISTS "public"."origin_temp";
CREATE TABLE "public"."origin_temp" (
  "code" varchar(255) COLLATE "pg_catalog"."default",
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "price_code" varchar(255) COLLATE "pg_catalog"."default",
  "toped_code" varchar(255) COLLATE "pg_catalog"."default",
  "city_id" int8,
  "city_id_price" int8
)
;
ALTER TABLE "public"."origin_temp" OWNER TO "postgres";

-- ----------------------------
-- Table structure for package_price
-- ----------------------------
DROP TABLE IF EXISTS "public"."package_price";
CREATE TABLE "public"."package_price" (
  "package_price_id" int8 NOT NULL DEFAULT nextval('package_price_package_price_id_seq'::regclass),
  "package_type_id" int8 NOT NULL,
  "branch_id_from" int8,
  "country_id_from" int8,
  "province_id_from" int8,
  "city_id_from" int8,
  "district_id_from" int8,
  "branch_id_to" int8,
  "country_id_to" int8,
  "province_id_to" int8,
  "city_id_to" int8,
  "district_id_to" int8,
  "min_weight" numeric(10,5),
  "basic_fare" numeric(20,5) NOT NULL,
  "next_price" numeric(20,5) NOT NULL,
  "disc_price_percent" numeric(10,5) NOT NULL,
  "disc_price_value" numeric(20,5) NOT NULL,
  "divider_volume" numeric(10,5),
  "lead_time_min_days" numeric(10,5),
  "lead_time_max_days" numeric(10,5),
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "from_type" int4,
  "to_type" int4,
  "from_id" int8,
  "to_id" int8,
  "dok1kg" numeric(20,5),
  "dok2kg" numeric(20,5)
)
;
ALTER TABLE "public"."package_price" OWNER TO "postgres";

-- ----------------------------
-- Table structure for package_price_special
-- ----------------------------
DROP TABLE IF EXISTS "public"."package_price_special";
CREATE TABLE "public"."package_price_special" (
  "package_price_special_id" int8 NOT NULL DEFAULT nextval('package_price_special_package_price_special_id_seq'::regclass),
  "package_type_id" int8 NOT NULL,
  "no_period" bool NOT NULL DEFAULT false,
  "start_date" timestamp(6),
  "end_date" timestamp(6),
  "customer_account_id" int8,
  "branch_id_from" int8,
  "country_id_from" int8,
  "province_id_from" int8,
  "city_id_from" int8,
  "district_id_from" int8,
  "branch_id_to" int8,
  "country_id_to" int8,
  "province_id_to" int8,
  "city_id_to" int8,
  "district_id_to" int8,
  "priority" int4 NOT NULL DEFAULT 1,
  "min_weight" numeric(10,5),
  "basic_fare" numeric(20,5) NOT NULL,
  "next_price" numeric(20,5) NOT NULL,
  "disc_price_percent" numeric(10,5) NOT NULL,
  "disc_price_value" numeric(10,5) NOT NULL,
  "divider_volume" numeric(10,5),
  "lead_time_min_days" numeric(10,5),
  "lead_time_max_days" numeric(10,5),
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "from_type" int4,
  "to_type" int4,
  "from_id" int8,
  "to_id" int8
)
;
ALTER TABLE "public"."package_price_special" OWNER TO "postgres";

-- ----------------------------
-- Table structure for package_type
-- ----------------------------
DROP TABLE IF EXISTS "public"."package_type";
CREATE TABLE "public"."package_type" (
  "package_type_id" int8 NOT NULL DEFAULT nextval('package_type_package_type_id_seq'::regclass),
  "package_type_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "package_type_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "min_weight" numeric(10,5) NOT NULL,
  "weight_rounding_const" numeric(10,5) NOT NULL,
  "weight_rounding_up_global" numeric(10,5) NOT NULL,
  "weight_rounding_up_detail" numeric(10,5) NOT NULL,
  "divider_volume" numeric(10,5) NOT NULL,
  "lead_time_min_days" numeric(10,5) NOT NULL,
  "lead_time_max_days" numeric(10,5) NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "weight_rounding_up_global_bool" bool DEFAULT false,
  "weight_rounding_up_detail_bool" bool DEFAULT false
)
;
ALTER TABLE "public"."package_type" OWNER TO "postgres";

-- ----------------------------
-- Table structure for partner
-- ----------------------------
DROP TABLE IF EXISTS "public"."partner";
CREATE TABLE "public"."partner" (
  "partner_id" int8 NOT NULL DEFAULT nextval('partner_partner_id_seq'::regclass),
  "partner_name" varchar(255) COLLATE "pg_catalog"."default",
  "partner_email" varchar(500) COLLATE "pg_catalog"."default",
  "api_key" varchar(500) COLLATE "pg_catalog"."default",
  "customer_account_id" int8,
  "awb_number_start" int8,
  "awb_number_end" int8,
  "current_awb_number" int8,
  "sla_hour_pickup" int4,
  "is_active" bool NOT NULL DEFAULT false,
  "is_email_log" bool NOT NULL DEFAULT false,
  "is_assign_to_branch" bool NOT NULL DEFAULT false,
  "is_assign_to_courier" bool NOT NULL DEFAULT false,
  "is_pick_unpick" bool NOT NULL DEFAULT false,
  "is_reschedule" bool NOT NULL DEFAULT false,
  "sm_code" varchar(20) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "user_created" varchar(255) COLLATE "pg_catalog"."default",
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "validation" json
)
;
ALTER TABLE "public"."partner" OWNER TO "postgres";

-- ----------------------------
-- Table structure for partner_logistic
-- ----------------------------
DROP TABLE IF EXISTS "public"."partner_logistic";
CREATE TABLE "public"."partner_logistic" (
  "partner_logistic_id" int8 NOT NULL DEFAULT nextval('partner_logistic_partner_logistic_id_seq'::regclass),
  "partner_logistic_name" varchar(500) COLLATE "pg_catalog"."default",
  "partner_logistic_email" varchar(500) COLLATE "pg_catalog"."default",
  "partner_logistic_notelp" varchar(100) COLLATE "pg_catalog"."default",
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."partner_logistic" OWNER TO "postgres";

-- ----------------------------
-- Table structure for payment_method
-- ----------------------------
DROP TABLE IF EXISTS "public"."payment_method";
CREATE TABLE "public"."payment_method" (
  "payment_method_id" int8 NOT NULL DEFAULT nextval('payment_method_payment_method_id_seq'::regclass),
  "payment_method_code" varchar(255) COLLATE "pg_catalog"."default",
  "payment_method_name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."payment_method" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pickup_request
-- ----------------------------
DROP TABLE IF EXISTS "public"."pickup_request";
CREATE TABLE "public"."pickup_request" (
  "pickup_request_id" int8 NOT NULL DEFAULT nextval('pickup_request_pickup_request_id_seq'::regclass),
  "pickup_request_code" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_request_name" varchar(500) COLLATE "pg_catalog"."default",
  "pickup_request_email" varchar(500) COLLATE "pg_catalog"."default",
  "pickup_request_contact_no" varchar(100) COLLATE "pg_catalog"."default",
  "pickup_request_address" text COLLATE "pg_catalog"."default",
  "pickup_request_date_time" timestamp(6),
  "pickup_schedule_date_time" timestamp(6),
  "pickup_request_notes" text COLLATE "pg_catalog"."default",
  "pickup_request_status_id" int8,
  "pickup_request_status_id_last" int8,
  "pickup_request_type" varchar(50) COLLATE "pg_catalog"."default",
  "reference_no" varchar(200) COLLATE "pg_catalog"."default",
  "order_date_time" timestamp(6),
  "expired_date_time" timestamp(6),
  "encrypt_address100" varchar(100) COLLATE "pg_catalog"."default",
  "encrypt_address255" varchar(255) COLLATE "pg_catalog"."default",
  "merchant_code" varchar(500) COLLATE "pg_catalog"."default",
  "reference_number" varchar(200) COLLATE "pg_catalog"."default",
  "partner_id" int8,
  "total_awb" int4,
  "user_id_created" int8 NOT NULL,
  "user_created" varchar(255) COLLATE "pg_catalog"."default",
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "encrypt_merchant_name" varchar(255) COLLATE "pg_catalog"."default",
  "confirm_date" timestamp(6)
)
;
ALTER TABLE "public"."pickup_request" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pickup_request_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."pickup_request_detail";
CREATE TABLE "public"."pickup_request_detail" (
  "pickup_request_detail_id" int8 NOT NULL DEFAULT nextval('pickup_request_detail_pickup_request_detail_id_seq'::regclass),
  "pickup_request_id" int8,
  "awb_item_id" int8,
  "ref_awb_number" varchar(100) COLLATE "pg_catalog"."default",
  "cust_package_id" varchar(255) COLLATE "pg_catalog"."default",
  "delivery_type" varchar(255) COLLATE "pg_catalog"."default",
  "destination_code" varchar(255) COLLATE "pg_catalog"."default",
  "notes" text COLLATE "pg_catalog"."default",
  "origin_code" varchar(255) COLLATE "pg_catalog"."default",
  "parcel_category" varchar(255) COLLATE "pg_catalog"."default",
  "parcel_content" text COLLATE "pg_catalog"."default",
  "parcel_height" int4,
  "parcel_length" int4,
  "parcel_width" int4,
  "parcel_qty" numeric(20,2),
  "parcel_disc_value" numeric(20,2),
  "parcel_value" numeric(20,2),
  "parcel_uom" varchar(20) COLLATE "pg_catalog"."default",
  "cod_value" numeric(20,2),
  "est_shipping_fee" numeric(20,2),
  "recipient_address" text COLLATE "pg_catalog"."default",
  "recipient_city" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_district" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_name" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_phone" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_province" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_title" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_zip" varchar(20) COLLATE "pg_catalog"."default",
  "shipper_address" text COLLATE "pg_catalog"."default",
  "shipper_city" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_district" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_name" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_phone" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_province" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_zip" varchar(20) COLLATE "pg_catalog"."default",
  "total_weight" numeric(20,2),
  "work_order_id_last" int8,
  "user_id_created" int8 NOT NULL,
  "user_created" varchar(255) COLLATE "pg_catalog"."default",
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "is_return" bool NOT NULL DEFAULT false,
  "recipient_longitude" varchar(100) COLLATE "pg_catalog"."default",
  "recipient_latitude" varchar(100) COLLATE "pg_catalog"."default",
  "is_engaged" bool
)
;
ALTER TABLE "public"."pickup_request_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pickup_request_invalid
-- ----------------------------
DROP TABLE IF EXISTS "public"."pickup_request_invalid";
CREATE TABLE "public"."pickup_request_invalid" (
  "pickup_request_invalid_id" int8 NOT NULL DEFAULT nextval('pickup_request_invalid_pickup_request_invalid_id_seq'::regclass),
  "pickup_request_date_time" timestamp(6),
  "ref_awb_number" varchar(100) COLLATE "pg_catalog"."default",
  "message_error" varchar(500) COLLATE "pg_catalog"."default",
  "request" json,
  "partner_id" int8,
  "user_id_created" int8 NOT NULL,
  "user_created" varchar(255) COLLATE "pg_catalog"."default",
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."pickup_request_invalid" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pickup_request_log
-- ----------------------------
DROP TABLE IF EXISTS "public"."pickup_request_log";
CREATE TABLE "public"."pickup_request_log" (
  "pickup_request_log_id" int8 NOT NULL DEFAULT nextval('pickup_request_log_pickup_request_log_id_seq'::regclass),
  "pickup_request_id" int8 NOT NULL,
  "pickup_request_date_time" timestamp(6),
  "ref_awb_number" varchar(100) COLLATE "pg_catalog"."default",
  "message_error" varchar(500) COLLATE "pg_catalog"."default",
  "request" json,
  "partner_id" int8,
  "user_id_created" int8 NOT NULL,
  "user_created" varchar(255) COLLATE "pg_catalog"."default",
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."pickup_request_log" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pickup_request_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."pickup_request_status";
CREATE TABLE "public"."pickup_request_status" (
  "pickup_request_status_id" int8 NOT NULL,
  "status_code" varchar(100) COLLATE "pg_catalog"."default",
  "status_title" varchar(100) COLLATE "pg_catalog"."default",
  "status_name" varchar(100) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."pickup_request_status" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pickup_request_upload
-- ----------------------------
DROP TABLE IF EXISTS "public"."pickup_request_upload";
CREATE TABLE "public"."pickup_request_upload" (
  "pickup_request_upload_id" int8 NOT NULL DEFAULT nextval('pickup_request_upload_pickup_request_upload_id_seq'::regclass),
  "pickup_request_upload_code" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_request_upload_name" varchar(500) COLLATE "pg_catalog"."default",
  "pickup_request_upload_email" varchar(500) COLLATE "pg_catalog"."default",
  "pickup_request_upload_contact_no" varchar(100) COLLATE "pg_catalog"."default",
  "pickup_request_upload_address" text COLLATE "pg_catalog"."default",
  "pickup_request_upload_date_time" timestamp(6),
  "pickup_schedule_date_time" timestamp(6),
  "pickup_request_upload_notes" text COLLATE "pg_catalog"."default",
  "pickup_request_upload_status_id" int8,
  "pickup_request_upload_status_id_last" int8,
  "pickup_request_upload_type" varchar(50) COLLATE "pg_catalog"."default",
  "reference_no" varchar(200) COLLATE "pg_catalog"."default",
  "order_date_time" timestamp(6),
  "expired_date_time" timestamp(6),
  "encrypt_address100" varchar(100) COLLATE "pg_catalog"."default",
  "encrypt_address255" varchar(255) COLLATE "pg_catalog"."default",
  "merchant_code" varchar(500) COLLATE "pg_catalog"."default",
  "reference_number" varchar(200) COLLATE "pg_catalog"."default",
  "partner_id" int8,
  "total_awb" int4,
  "user_id_created" int8 NOT NULL,
  "user_created" varchar(255) COLLATE "pg_catalog"."default",
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "encrypt_merchant_name" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."pickup_request_upload" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pickup_request_upload_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."pickup_request_upload_detail";
CREATE TABLE "public"."pickup_request_upload_detail" (
  "pickup_request_upload_detail_id" int8 NOT NULL DEFAULT nextval('pickup_request_upload_detail_pickup_request_upload_detail_id_se'::regclass),
  "pickup_request_upload_id" int8,
  "awb_item_id" int8,
  "ref_awb_number" varchar(100) COLLATE "pg_catalog"."default",
  "cust_package_id" varchar(255) COLLATE "pg_catalog"."default",
  "delivery_type" varchar(255) COLLATE "pg_catalog"."default",
  "destination_code" varchar(255) COLLATE "pg_catalog"."default",
  "notes" text COLLATE "pg_catalog"."default",
  "origin_code" varchar(255) COLLATE "pg_catalog"."default",
  "parcel_category" varchar(255) COLLATE "pg_catalog"."default",
  "parcel_content" text COLLATE "pg_catalog"."default",
  "parcel_height" int4,
  "parcel_length" int4,
  "parcel_width" int4,
  "parcel_qty" numeric(20,2),
  "parcel_disc_value" numeric(20,2),
  "parcel_value" numeric(20,2),
  "parcel_uom" varchar(20) COLLATE "pg_catalog"."default",
  "cod_value" numeric(20,2),
  "est_shipping_fee" numeric(20,2),
  "recipient_address" text COLLATE "pg_catalog"."default",
  "recipient_city" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_district" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_name" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_phone" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_province" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_title" varchar(255) COLLATE "pg_catalog"."default",
  "recipient_zip" varchar(20) COLLATE "pg_catalog"."default",
  "shipper_address" text COLLATE "pg_catalog"."default",
  "shipper_city" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_district" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_name" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_phone" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_province" varchar(255) COLLATE "pg_catalog"."default",
  "shipper_zip" varchar(20) COLLATE "pg_catalog"."default",
  "total_weight" numeric(20,2),
  "work_order_id_last" int8,
  "user_id_created" int8 NOT NULL,
  "user_created" varchar(255) COLLATE "pg_catalog"."default",
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "user_updated" varchar(255) COLLATE "pg_catalog"."default",
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."pickup_request_upload_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for place
-- ----------------------------
DROP TABLE IF EXISTS "public"."place";
CREATE TABLE "public"."place" (
  "place_id" int8 NOT NULL DEFAULT nextval('place_place_id_seq'::regclass),
  "place_type_id" int8,
  "district_id" int8 NOT NULL,
  "place_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "place_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "address" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."place" OWNER TO "postgres";

-- ----------------------------
-- Table structure for place_temp
-- ----------------------------
DROP TABLE IF EXISTS "public"."place_temp";
CREATE TABLE "public"."place_temp" (
  "place_temp" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "district_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "district_id" int8
)
;
ALTER TABLE "public"."place_temp" OWNER TO "postgres";

-- ----------------------------
-- Table structure for place_type
-- ----------------------------
DROP TABLE IF EXISTS "public"."place_type";
CREATE TABLE "public"."place_type" (
  "place_type_id" int8 NOT NULL DEFAULT nextval('place_type_place_type_id_seq'::regclass),
  "place_type_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "place_type_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."place_type" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pod_scan
-- ----------------------------
DROP TABLE IF EXISTS "public"."pod_scan";
CREATE TABLE "public"."pod_scan" (
  "pod_scan_id" int8 NOT NULL DEFAULT nextval('pod_scan_pod_scan_id_seq'::regclass),
  "do_pod_id" int8,
  "awb_id" int8,
  "awb_item_id" int8,
  "branch_id" int8,
  "user_id" int8,
  "pod_scanin_date_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "bag_id" int8,
  "bag_item_id" int8
)
;
ALTER TABLE "public"."pod_scan" OWNER TO "postgres";

-- ----------------------------
-- Table structure for pod_scan_in
-- ----------------------------
DROP TABLE IF EXISTS "public"."pod_scan_in";
CREATE TABLE "public"."pod_scan_in" (
  "pod_scan_in_id" int8 NOT NULL DEFAULT nextval('pod_scan_in_pod_scan_in_id_seq'::regclass),
  "awb_item_id" bigint,
  "bag_item_id" bigint,
  "user_id" bigint NOT NULL,
  "employee_id" bigint NOT NULL,
  "branch_id" bigint,
  "scan_in_type" character varying(10) NOT NULL,
  "pod_scanin_date_time" timestamp without time zone NOT NULL,
  "user_id_created" bigint NOT NULL,
  "created_time" timestamp without time zone NOT NULL,
  "user_id_updated" bigint NOT NULL,
  "updated_time" timestamp without time zone NOT NULL,
  "is_deleted" boolean DEFAULT false NOT NULL
)
;
ALTER TABLE "public"."pod_scan_in" OWNER TO "postgres";

-- ----------------------------
-- Table structure for province
-- ----------------------------
DROP TABLE IF EXISTS "public"."province";
CREATE TABLE "public"."province" (
  "province_id" int8 NOT NULL DEFAULT nextval('province_province_id_seq'::regclass),
  "country_id" int8 NOT NULL,
  "province_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "province_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."province" OWNER TO "postgres";

-- ----------------------------
-- Table structure for reason
-- ----------------------------
DROP TABLE IF EXISTS "public"."reason";
CREATE TABLE "public"."reason" (
  "reason_id" int8 NOT NULL DEFAULT nextval('reason_reason_id_seq'::regclass),
  "apps_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "reason_category" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "reason_type" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "reason_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "reason_name" varchar(500) COLLATE "pg_catalog"."default",
  "reason_description" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "is_reschedule_pickup" bool DEFAULT true,
  "is_reschedule" bool DEFAULT true
)
;
ALTER TABLE "public"."reason" OWNER TO "postgres";

-- ----------------------------
-- Table structure for received_package
-- ----------------------------
DROP TABLE IF EXISTS "public"."received_package";
CREATE TABLE "public"."received_package" (
  "received_package_id" int8 NOT NULL DEFAULT nextval('received_package_received_package_id_seq'::regclass),
  "received_package_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "employee_id_consignee" int8 NOT NULL,
  "sender_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "received_package_date" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "total_seq" int4,
  "merchant_name" varchar(255) COLLATE "pg_catalog"."default",
  "phone" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."received_package" OWNER TO "postgres";

-- ----------------------------
-- Table structure for received_package_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."received_package_detail";
CREATE TABLE "public"."received_package_detail" (
  "received_package_detail_id" int8 NOT NULL DEFAULT nextval('received_package_detail_received_package_detail_id_seq'::regclass),
  "received_package_id" int8 NOT NULL,
  "awb_number" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."received_package_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for representative
-- ----------------------------
DROP TABLE IF EXISTS "public"."representative";
CREATE TABLE "public"."representative" (
  "representative_id" int8 NOT NULL DEFAULT nextval('representative_representative_id_seq'::regclass),
  "representative_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "representative_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(500) COLLATE "pg_catalog"."default",
  "branch_id" int8,
  "min_weight" numeric(10,5) NOT NULL DEFAULT 0,
  "price_per_kg" numeric(10,5) NOT NULL DEFAULT 0,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "representative_id_parent" int8
)
;
ALTER TABLE "public"."representative" OWNER TO "postgres";

-- ----------------------------
-- Table structure for representative_temp
-- ----------------------------
DROP TABLE IF EXISTS "public"."representative_temp";
CREATE TABLE "public"."representative_temp" (
  "representative_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "representative_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "min_weight" varchar(255) COLLATE "pg_catalog"."default",
  "price_per_kg" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."representative_temp" OWNER TO "postgres";

-- ----------------------------
-- Table structure for reseller
-- ----------------------------
DROP TABLE IF EXISTS "public"."reseller";
CREATE TABLE "public"."reseller" (
  "reseller_id" int8 NOT NULL DEFAULT nextval('reseller_reseller_id_seq'::regclass),
  "branch_id" int8 NOT NULL,
  "district_id" int8 NOT NULL,
  "reseller_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "reseller_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "address" text COLLATE "pg_catalog"."default" NOT NULL,
  "phone1" varchar(20) COLLATE "pg_catalog"."default",
  "phone2" varchar(20) COLLATE "pg_catalog"."default",
  "mobile1" varchar(20) COLLATE "pg_catalog"."default",
  "mobile2" varchar(20) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."reseller" OWNER TO "postgres";

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS "public"."role";
CREATE TABLE "public"."role" (
  "role_id" int8 NOT NULL DEFAULT nextval('role_role_id_seq'::regclass),
  "role_id_parent" int8,
  "branch_id" int8,
  "lft" int4,
  "rgt" int4,
  "depth" int4,
  "priority" int4,
  "role_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "allow_show_region" bool
)
;
ALTER TABLE "public"."role" OWNER TO "postgres";

-- ----------------------------
-- Table structure for role_permission
-- ----------------------------
DROP TABLE IF EXISTS "public"."role_permission";
CREATE TABLE "public"."role_permission" (
  "role_permission_id" int8 NOT NULL DEFAULT nextval('role_permission_role_permission_id_seq'::regclass),
  "role_id" int8 NOT NULL,
  "nav" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."role_permission" OWNER TO "postgres";

-- ----------------------------
-- Table structure for role_permission_access
-- ----------------------------
DROP TABLE IF EXISTS "public"."role_permission_access";
CREATE TABLE "public"."role_permission_access" (
  "role_permission_access_id" int8 NOT NULL DEFAULT nextval('role_permission_access_role_permission_access_id'::regclass),
  "role_id" int8 NOT NULL,
  "role_permission_id" int8 NOT NULL,
  "nav" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."role_permission_access" OWNER TO "postgres";

-- ----------------------------
-- Table structure for role_permission_dashboard
-- ----------------------------
DROP TABLE IF EXISTS "public"."role_permission_dashboard";
CREATE TABLE "public"."role_permission_dashboard" (
  "role_permission_dashboard_id" int8 NOT NULL DEFAULT nextval('role_permission_dashboard_role_permission_dashboard_id_seq'::regclass),
  "role_id" int8 NOT NULL,
  "nav" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."role_permission_dashboard" OWNER TO "postgres";

-- ----------------------------
-- Table structure for schema_migrations
-- ----------------------------
DROP TABLE IF EXISTS "public"."schema_migrations";
CREATE TABLE "public"."schema_migrations" (
  "version" varchar COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "public"."schema_migrations" OWNER TO "postgres";

-- ----------------------------
-- Table structure for smu
-- ----------------------------
DROP TABLE IF EXISTS "public"."smu";
CREATE TABLE "public"."smu" (
  "smu_id" int8 NOT NULL DEFAULT nextval('smu_smu_id_seq'::regclass),
  "smu_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "smu_airline_number" varchar(255) COLLATE "pg_catalog"."default",
  "smu_date_time" timestamp(6) NOT NULL,
  "airline_id" int8,
  "representative_id" int8 NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "flight_number" varchar(255) COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "departure_time" timestamp(6) NOT NULL DEFAULT '2018-09-18 11:01:58'::timestamp without time zone,
  "arrival_time" timestamp(6) NOT NULL DEFAULT '2018-09-18 11:01:58'::timestamp without time zone,
  "total_item" int4 NOT NULL DEFAULT 0,
  "total_weight" numeric(10,5),
  "smu_date" date,
  "do_smu_id_delivery" int8,
  "do_smu_id_pickup" int8,
  "actual_departure_time" timestamp(6),
  "smu_service" varchar(255) COLLATE "pg_catalog"."default",
  "actual_airline_id" int8,
  "actual_flight_number" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."smu" OWNER TO "postgres";

-- ----------------------------
-- Table structure for smu_item
-- ----------------------------
DROP TABLE IF EXISTS "public"."smu_item";
CREATE TABLE "public"."smu_item" (
  "smu_item_id" int8 NOT NULL DEFAULT nextval('smu_item_smu_item_id_seq'::regclass),
  "smu_id" int8 NOT NULL,
  "bagging_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "do_smu_id_delivery" int8,
  "do_smu_id_pickup" int8
)
;
ALTER TABLE "public"."smu_item" OWNER TO "postgres";

-- ----------------------------
-- Table structure for social_media
-- ----------------------------
DROP TABLE IF EXISTS "public"."social_media";
CREATE TABLE "public"."social_media" (
  "social_media_id" int8 NOT NULL DEFAULT nextval('social_media_social_media_id_seq'::regclass),
  "social_media_name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."social_media" OWNER TO "postgres";

-- ----------------------------
-- Table structure for sync_awb
-- ----------------------------
DROP TABLE IF EXISTS "public"."sync_awb";
CREATE TABLE "public"."sync_awb" (
  "sync_awb_id" int8 NOT NULL DEFAULT nextval('sync_awb_sync_awb_id_seq'::regclass),
  "sync_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "request_date" timestamp(6) NOT NULL,
  "total_data" int4 NOT NULL DEFAULT 0,
  "request" text COLLATE "pg_catalog"."default",
  "response" text COLLATE "pg_catalog"."default",
  "is_success" bool NOT NULL DEFAULT false,
  "is_dead" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."sync_awb" OWNER TO "postgres";

-- ----------------------------
-- Table structure for sync_awb_file
-- ----------------------------
DROP TABLE IF EXISTS "public"."sync_awb_file";
CREATE TABLE "public"."sync_awb_file" (
  "sync_awb_file_id" int8 NOT NULL DEFAULT nextval('sync_awb_file_sync_awb_file_id_seq'::regclass),
  "sync_id" int8 NOT NULL,
  "download_date" timestamp(6),
  "filename" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "url" text COLLATE "pg_catalog"."default",
  "error_message" text COLLATE "pg_catalog"."default",
  "total_update" int4 NOT NULL DEFAULT 0,
  "total_insert" int4 NOT NULL DEFAULT 0,
  "is_done" bool NOT NULL DEFAULT false,
  "is_dead" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."sync_awb_file" OWNER TO "postgres";

-- ----------------------------
-- Table structure for sync_master
-- ----------------------------
DROP TABLE IF EXISTS "public"."sync_master";
CREATE TABLE "public"."sync_master" (
  "sync_master_id" int8 NOT NULL DEFAULT nextval('sync_master_sync_master_id_seq'::regclass),
  "module" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "session_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "sync_last_updated" timestamp(6) NOT NULL,
  "limit_data" int4 NOT NULL,
  "total_pages" int4 NOT NULL,
  "total_data" int4 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "sync_start_updated" timestamp(6)
)
;
ALTER TABLE "public"."sync_master" OWNER TO "postgres";

-- ----------------------------
-- Table structure for sync_master_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."sync_master_history";
CREATE TABLE "public"."sync_master_history" (
  "sync_master_history_id" int8 NOT NULL DEFAULT nextval('sync_master_history_sync_master_history_id_seq'::regclass),
  "sync_master_id" int8 NOT NULL,
  "module" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "page" int4 NOT NULL,
  "try_seq" int4 NOT NULL,
  "sync_url" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "sync_status" int4 NOT NULL,
  "request_datetime" timestamp(6) NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."sync_master_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for sys_counter
-- ----------------------------
DROP TABLE IF EXISTS "public"."sys_counter";
CREATE TABLE "public"."sys_counter" (
  "sys_counter_id" int8 NOT NULL DEFAULT nextval('sys_counter_sys_counter_id_seq'::regclass),
  "key" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "counter" int8 NOT NULL DEFAULT 1,
  "created_time" timestamp(6) NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."sys_counter" OWNER TO "postgres";

-- ----------------------------
-- Table structure for todos
-- ----------------------------
DROP TABLE IF EXISTS "public"."todos";
CREATE TABLE "public"."todos" (
  "id" int8 NOT NULL DEFAULT nextval('todos_id_seq'::regclass),
  "title" varchar COLLATE "pg_catalog"."default",
  "created_by" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL,
  "updated_at" timestamp(6) NOT NULL
)
;
ALTER TABLE "public"."todos" OWNER TO "postgres";

-- ----------------------------
-- Table structure for user_api
-- ----------------------------
DROP TABLE IF EXISTS "public"."user_api";
CREATE TABLE "public"."user_api" (
  "id" int8 NOT NULL DEFAULT nextval('user_api_id_seq'::regclass),
  "name" varchar COLLATE "pg_catalog"."default",
  "email" varchar COLLATE "pg_catalog"."default",
  "password_digest" varchar COLLATE "pg_catalog"."default",
  "is_deleted" bool DEFAULT false,
  "created_time" timestamp(6),
  "updated_time" timestamp(6),
  "client_id" int8
)
;
ALTER TABLE "public"."user_api" OWNER TO "postgres";

-- ----------------------------
-- Table structure for user_notification_msg
-- ----------------------------
DROP TABLE IF EXISTS "public"."user_notification_msg";
CREATE TABLE "public"."user_notification_msg" (
  "user_notification_msg_id" int8 NOT NULL DEFAULT nextval('user_notification_msg_user_notification_msg_id_seq'::regclass),
  "notification_msg_id" int8 NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "notification_token_id_ref" jsonb NOT NULL,
  "response_token" jsonb,
  "is_notif_sent" int4 NOT NULL DEFAULT 0,
  "is_open" bool NOT NULL DEFAULT false,
  "is_read" bool NOT NULL DEFAULT false,
  "last_seen" timestamp(6),
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."user_notification_msg" OWNER TO "postgres";

-- ----------------------------
-- Table structure for user_role
-- ----------------------------
DROP TABLE IF EXISTS "public"."user_role";
CREATE TABLE "public"."user_role" (
  "user_id" int8 NOT NULL,
  "role_id" int8 NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "branch_id" int8 NOT NULL DEFAULT 1,
  "user_role_id" int8 NOT NULL DEFAULT nextval('user_role_user_role_id_seq'::regclass)
)
;
ALTER TABLE "public"."user_role" OWNER TO "postgres";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "user_id" int8 NOT NULL DEFAULT nextval('user_user_id_seq'::regclass),
  "employee_id" int8,
  "first_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "last_name" varchar(255) COLLATE "pg_catalog"."default",
  "username" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "login_count" int4,
  "login_attempt_error" int4,
  "last_login" timestamp(6),
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "password_reset" varchar(500) COLLATE "pg_catalog"."default",
  "otp_reset" varchar(500) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."users" OWNER TO "postgres";

-- ----------------------------
-- Table structure for work_order
-- ----------------------------
DROP TABLE IF EXISTS "public"."work_order";
CREATE TABLE "public"."work_order" (
  "work_order_id" int8 NOT NULL DEFAULT nextval('work_order_work_order_id_seq'::regclass),
  "work_order_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "work_order_date" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "is_member" bool NOT NULL,
  "customer_account_id" int8,
  "customer_account_id_child" int8,
  "guest_name" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_schedule_date_time" timestamp(6) NOT NULL,
  "pickup_phone" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_email" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_address" text COLLATE "pg_catalog"."default",
  "pickup_notes" text COLLATE "pg_catalog"."default",
  "branch_id_assigned" int8,
  "total_assigned" int4 DEFAULT 0,
  "is_assigned" bool DEFAULT false,
  "employee_id_driver" int8,
  "latitude_last" varchar(100) COLLATE "pg_catalog"."default",
  "longitude_last" varchar(100) COLLATE "pg_catalog"."default",
  "consignee_name" varchar(255) COLLATE "pg_catalog"."default",
  "received_date_time" timestamp(6),
  "total_item" int4 NOT NULL DEFAULT 0,
  "total_pickup_item" int4 NOT NULL DEFAULT 0,
  "total_weight" numeric(20,5) NOT NULL DEFAULT 0,
  "history_date_time_last" timestamp(6),
  "work_order_status_id_last" int8,
  "work_order_history_id_last" int8,
  "do_pickup_detail_id_last" int8,
  "work_order_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "work_order_group" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "encrypt_address100" varchar(100) COLLATE "pg_catalog"."default",
  "encrypt_address255" varchar(255) COLLATE "pg_catalog"."default",
  "do_pickup_id_last" int8,
  "pickup_date_time" timestamp(6),
  "check_in_date_time" timestamp(6),
  "check_out_date_time" timestamp(6),
  "work_order_uid" varchar(255) COLLATE "pg_catalog"."default",
  "reason_id" int8,
  "reason_note" text COLLATE "pg_catalog"."default",
  "total_awb_qty" int4 DEFAULT 0,
  "work_order_status_id_pick" int8,
  "sigesit_notes" text COLLATE "pg_catalog"."default",
  "drop_date_time" timestamp(6),
  "is_final" bool DEFAULT false,
  "ref_work_order_id" int8,
  "merchant_name" varchar(255) COLLATE "pg_catalog"."default",
  "item_type" int8 DEFAULT 0,
  "encrypt_merchant_name" varchar(255) COLLATE "pg_catalog"."default",
  "do_status" int4 DEFAULT 0
)
;
ALTER TABLE "public"."work_order" OWNER TO "postgres";

-- ----------------------------
-- Table structure for work_order_detail
-- ----------------------------
DROP TABLE IF EXISTS "public"."work_order_detail";
CREATE TABLE "public"."work_order_detail" (
  "work_order_detail_id" int8 NOT NULL DEFAULT nextval('work_order_detail_work_order_detail_id_seq'::regclass),
  "work_order_id" int8 NOT NULL,
  "pickup_request_id" int8,
  "awb_item_id" int8,
  "work_order_status_id_last" int8,
  "reason_id" int8,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "pickup_date_time" timestamp(6),
  "check_in_date_time" timestamp(6),
  "check_out_date_time" timestamp(6),
  "work_order_status_id_pick" int8,
  "drop_date_time" timestamp(6),
  "ref_awb_number" varchar(100) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."work_order_detail" OWNER TO "postgres";

-- ----------------------------
-- Table structure for work_order_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."work_order_history";
CREATE TABLE "public"."work_order_history" (
  "work_order_history_id" int8 NOT NULL DEFAULT nextval('work_order_history_work_order_history_id_seq'::regclass),
  "work_order_id" int8 NOT NULL,
  "work_order_seq" int4,
  "work_order_date" timestamp(6),
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "is_member" bool,
  "customer_account_id" int8,
  "customer_account_id_child" int8,
  "guest_name" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_schedule_date_time" timestamp(6),
  "pickup_phone" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_email" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_address" text COLLATE "pg_catalog"."default",
  "pickup_notes" text COLLATE "pg_catalog"."default",
  "branch_id_assigned" int8,
  "total_assigned" int4,
  "is_assigned" bool,
  "employee_id_driver" int8,
  "latitude_last" varchar(100) COLLATE "pg_catalog"."default",
  "longitude_last" varchar(100) COLLATE "pg_catalog"."default",
  "consignee_name" varchar(255) COLLATE "pg_catalog"."default",
  "received_date_time" timestamp(6),
  "total_item" int4 NOT NULL DEFAULT 0,
  "total_pickup_item" int4 NOT NULL DEFAULT 0,
  "total_weight" numeric(20,5) NOT NULL DEFAULT 0,
  "history_date_time_last" timestamp(6),
  "history_notes" text COLLATE "pg_catalog"."default",
  "reason_id" int8,
  "work_order_status_id" int8 NOT NULL,
  "history_date_time" timestamp(6) NOT NULL,
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "do_pickup_id_last" int8,
  "is_posted" bool DEFAULT false,
  "send_tracking_note" int4,
  "is_final" bool DEFAULT false,
  "reason_note" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."work_order_history" OWNER TO "postgres";

-- ----------------------------
-- Table structure for work_order_schedule
-- ----------------------------
DROP TABLE IF EXISTS "public"."work_order_schedule";
CREATE TABLE "public"."work_order_schedule" (
  "work_order_schedule_id" int8 NOT NULL DEFAULT nextval('work_order_schedule_work_order_schedule_id_seq'::regclass),
  "work_order_schedule_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "work_order_schedule_date" timestamp(6) NOT NULL,
  "user_id" int8 NOT NULL,
  "branch_id" int8 NOT NULL,
  "is_member" bool NOT NULL,
  "customer_account_id" int8,
  "customer_account_id_child" int8,
  "guest_name" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_active_date" timestamp(6) NOT NULL,
  "pickup_phone" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_email" varchar(255) COLLATE "pg_catalog"."default",
  "pickup_address" text COLLATE "pg_catalog"."default",
  "pickup_notes" text COLLATE "pg_catalog"."default",
  "branch_id_assigned" int8,
  "employee_id_driver" int8,
  "encrypt_address100" varchar(100) COLLATE "pg_catalog"."default",
  "encrypt_address255" varchar(255) COLLATE "pg_catalog"."default",
  "is_monday" bool,
  "is_tuesday" bool,
  "is_wednesday" bool,
  "is_thursday" bool,
  "is_friday" bool,
  "is_saturday" bool,
  "is_sunday" bool,
  "pickup_time_monday" time(6),
  "pickup_time_tuesday" time(6),
  "pickup_time_wednesday" time(6),
  "pickup_time_thursday" time(6),
  "pickup_time_friday" time(6),
  "pickup_time_saturday" time(6),
  "pickup_time_sunday" time(6),
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "work_order_id_last" int8
)
;
ALTER TABLE "public"."work_order_schedule" OWNER TO "postgres";

-- ----------------------------
-- Table structure for work_order_status
-- ----------------------------
DROP TABLE IF EXISTS "public"."work_order_status";
CREATE TABLE "public"."work_order_status" (
  "work_order_status_id" int8 NOT NULL DEFAULT nextval('work_order_status_work_order_status_id_seq'::regclass),
  "status_code" varchar(255) COLLATE "pg_catalog"."default",
  "status_title" varchar(255) COLLATE "pg_catalog"."default",
  "status_name" varchar(255) COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false,
  "is_show_on_filter" bool DEFAULT false,
  "is_send_to_partner" bool
)
;
ALTER TABLE "public"."work_order_status" OWNER TO "postgres";

-- ----------------------------
-- Table structure for zone
-- ----------------------------
DROP TABLE IF EXISTS "public"."zone";
CREATE TABLE "public"."zone" (
  "zone_id" int8 NOT NULL DEFAULT nextval('zone_zone_id_seq'::regclass),
  "zone_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "zone_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "user_id_created" int8 NOT NULL,
  "created_time" timestamp(6) NOT NULL,
  "user_id_updated" int8 NOT NULL,
  "updated_time" timestamp(6) NOT NULL,
  "is_deleted" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."zone" OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_generate_v1
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v1"();
CREATE OR REPLACE FUNCTION "public"."uuid_generate_v1"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v1'
  LANGUAGE c VOLATILE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_generate_v1"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_generate_v1mc
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v1mc"();
CREATE OR REPLACE FUNCTION "public"."uuid_generate_v1mc"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v1mc'
  LANGUAGE c VOLATILE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_generate_v1mc"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_generate_v3
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v3"("namespace" uuid, "name" text);
CREATE OR REPLACE FUNCTION "public"."uuid_generate_v3"("namespace" uuid, "name" text)
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v3'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_generate_v3"("namespace" uuid, "name" text) OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_generate_v4
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v4"();
CREATE OR REPLACE FUNCTION "public"."uuid_generate_v4"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v4'
  LANGUAGE c VOLATILE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_generate_v4"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_generate_v5
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_generate_v5"("namespace" uuid, "name" text);
CREATE OR REPLACE FUNCTION "public"."uuid_generate_v5"("namespace" uuid, "name" text)
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_generate_v5'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_generate_v5"("namespace" uuid, "name" text) OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_nil
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_nil"();
CREATE OR REPLACE FUNCTION "public"."uuid_nil"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_nil'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_nil"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_ns_dns
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_dns"();
CREATE OR REPLACE FUNCTION "public"."uuid_ns_dns"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_dns'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_ns_dns"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_ns_oid
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_oid"();
CREATE OR REPLACE FUNCTION "public"."uuid_ns_oid"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_oid'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_ns_oid"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_ns_url
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_url"();
CREATE OR REPLACE FUNCTION "public"."uuid_ns_url"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_url'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_ns_url"() OWNER TO "postgres";

-- ----------------------------
-- Function structure for uuid_ns_x500
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."uuid_ns_x500"();
CREATE OR REPLACE FUNCTION "public"."uuid_ns_x500"()
  RETURNS "pg_catalog"."uuid" AS '$libdir/uuid-ossp', 'uuid_ns_x500'
  LANGUAGE c IMMUTABLE STRICT
  COST 1;
ALTER FUNCTION "public"."uuid_ns_x500"() OWNER TO "postgres";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."airline_airline_id_seq"', 8, true);
SELECT setval('"public"."airport_airport_id_seq"', 54, true);
SELECT setval('"public"."attachment_attachment_id_seq"', 38, true);
SELECT setval('"public"."attachment_tms_attachment_tms_id_seq"', 156, true);
SELECT setval('"public"."awb_attr_awb_attr_id_seq"', 23881630, true);
SELECT setval('"public"."awb_awb_id_seq"', 11942954, true);
SELECT setval('"public"."awb_booking_awb_booking_id_seq"', 11936111, true);
SELECT setval('"public"."awb_booking_status_awb_booking_status_id_seq"', 5, true);
SELECT setval('"public"."awb_detail_awb_detail_id_seq"', 2, false);
SELECT setval('"public"."awb_history_awb_history_id_seq"', 20793818, true);
SELECT setval('"public"."awb_invalid_awb_invalid_id_seq"', 3659, true);
SELECT setval('"public"."awb_item_attr_awb_item_attr_id_seq"', 2, false);
SELECT setval('"public"."awb_item_awb_item_id_seq"', 11942019, true);
SELECT setval('"public"."awb_item_summary_awb_item_summary_id_seq"', 13635679, true);
SELECT setval('"public"."awb_price_awb_price_id_seq"', 4308446, true);
SELECT setval('"public"."awb_price_item_awb_price_item_id_seq"', 4304438, true);
SELECT setval('"public"."awb_request_awb_request_id_seq"', 44, true);
SELECT setval('"public"."awb_solution_awb_solution_id_seq"', 2, false);
SELECT setval('"public"."awb_status_awb_status_id_seq"', 12, true);
SELECT setval('"public"."awb_status_group_awb_status_group_id_seq"', 3, true);
SELECT setval('"public"."awb_status_group_item_awb_status_group_item_id"', 9, true);
SELECT setval('"public"."awb_track_awb_track_id_seq"', 2, false);
SELECT setval('"public"."awb_trouble_awb_trouble_id_seq"', 2, false);
SELECT setval('"public"."bag_bag_id_seq"', 421893, true);
SELECT setval('"public"."bag_item_awb_bag_item_awb_id_seq"', 20073434, true);
SELECT setval('"public"."bag_item_bag_item_id_seq"', 859418, true);
SELECT setval('"public"."bag_item_history_bag_item_history_id_seq"', 389395, true);
SELECT setval('"public"."bag_item_status_bag_item_status_id_seq"', 2, false);
SELECT setval('"public"."bag_solution_bag_solution_id_seq"', 2, false);
SELECT setval('"public"."bag_trouble_bag_trouble_id_seq"', 17, true);
SELECT setval('"public"."bagging_bagging_id_seq"', 12710, true);
SELECT setval('"public"."bagging_item_bagging_item_id_seq"', 37550, true);
SELECT setval('"public"."bank_bank_id_seq"', 17, true);
SELECT setval('"public"."bank_branch_bank_branch_id_seq"', 7, true);
SELECT setval('"public"."branch_branch_id_seq"', 799, true);
ALTER SEQUENCE "public"."branch_region_branch_region_id_seq"
OWNED BY "public"."branch_region"."branch_region_id";
SELECT setval('"public"."branch_region_branch_region_id_seq"', 3, true);
SELECT setval('"public"."branch_software_branch_software_id_seq"', 3, true);
SELECT setval('"public"."calculation_discount_calculation_discount_id_seq"', 69364, true);
SELECT setval('"public"."calculation_discount_history_calculation_discount_history_id_se"', 1219999, true);
SELECT setval('"public"."city_city_id_seq"', 533, true);
SELECT setval('"public"."cms_option_cms_option_id_seq"', 4, true);
ALTER SEQUENCE "public"."country_country_id_seq"
OWNED BY "public"."country"."country_id";
SELECT setval('"public"."country_country_id_seq"', 55, true);
SELECT setval('"public"."customer_account_change_customer_account_change_id_seq"', 11, true);
SELECT setval('"public"."customer_account_customer_account_id_seq"', 20890, true);
SELECT setval('"public"."customer_account_merchant_customer_account_merchant_id_seq"', 2592, true);
SELECT setval('"public"."customer_account_post_history_customer_account_post_history_id_"', 2, false);
SELECT setval('"public"."customer_address_customer_address_id_seq"', 18444, true);
SELECT setval('"public"."customer_bank_change_customer_bank_change_id_seq"', 3, true);
SELECT setval('"public"."customer_bank_customer_bank_id_seq"', 3, true);
SELECT setval('"public"."customer_category_customer_category_id_seq"', 40, true);
SELECT setval('"public"."customer_customer_id_seq"', 16852, true);
SELECT setval('"public"."customer_grade_customer_grade_id_seq"', 5, true);
SELECT setval('"public"."customer_meta_change_customer_meta_change_id_seq"', 4, true);
SELECT setval('"public"."customer_meta_customer_meta_id_seq"', 13, true);
SELECT setval('"public"."customer_pickup_customer_pickup_id_seq"', 2, false);
SELECT setval('"public"."customer_setting_customer_setting_id_seq"', 4, true);
SELECT setval('"public"."customer_setting_detail_customer_setting_detail_id_seq"', 11, true);
SELECT setval('"public"."department_department_id_seq"', 27, true);
SELECT setval('"public"."detail_email_at_night_detail_email_at_night_id_seq"', 63133, true);
SELECT setval('"public"."detail_lph_detail_lph_id_seq"', 136, true);
SELECT setval('"public"."district_district_id_seq"', 7505, true);
SELECT setval('"public"."district_reference_district_reference_id_seq"', 2, false);
SELECT setval('"public"."division_department_id_seq"', 298, true);
SELECT setval('"public"."division_division_id_seq"', 10, true);
SELECT setval('"public"."do_pickup_detail_do_pickup_detail_id_seq"', 16947, true);
SELECT setval('"public"."do_pickup_do_pickup_id_seq"', 1081, true);
SELECT setval('"public"."do_pod_deliver_detail_do_pod_deliver_detail_id_seq"', 2, false);
SELECT setval('"public"."do_pod_deliver_do_pod_deliver_id_seq"', 2, false);
SELECT setval('"public"."do_pod_deliver_history_do_pod_deliver_history_id_seq"', 2, false);
SELECT setval('"public"."do_pod_detail_do_pod_detail_id_seq"', 39, true);
SELECT setval('"public"."do_pod_do_pod_id_seq"', 91, true);
SELECT setval('"public"."do_pod_history_do_pod_history_id_seq"', 4, true);
SELECT setval('"public"."do_pod_status_do_pod_status_id_seq"', 2, false);
SELECT setval('"public"."do_smu_detail_do_smu_detail_id_seq"', 24058, true);
SELECT setval('"public"."do_smu_do_smu_id_seq"', 1010, true);
SELECT setval('"public"."do_smu_history_do_smu_history_id_seq"', 15087, true);
SELECT setval('"public"."do_smu_status_do_smu_status_id_seq"', 2, false);
SELECT setval('"public"."do_work_order_detail_do_work_order_detail_id_seq"', 32, true);
SELECT setval('"public"."do_work_order_do_work_order_id_seq"', 7, true);
SELECT setval('"public"."email_at_night_email_at_night_id_seq"', 42, true);
SELECT setval('"public"."email_log_email_log_id_seq"', 8, true);
SELECT setval('"public"."email_log_history_email_log_history_id_seq"', 22, true);
SELECT setval('"public"."employee_education_employee_education_id_seq"', 2, false);
SELECT setval('"public"."employee_employee_id_seq"', 4565, true);
SELECT setval('"public"."employee_experience_employee_experience_id_seq"', 2, false);
SELECT setval('"public"."employee_family_employee_family_id_seq"', 2, false);
SELECT setval('"public"."employee_journal_employee_journal_id_seq"', 2, false);
SELECT setval('"public"."employee_journey_employee_journey_id_seq"', 27, true);
SELECT setval('"public"."employee_role_employee_role_id_seq"', 364, true);
SELECT setval('"public"."employee_source_employee_source_id_seq"', 3, true);
SELECT setval('"public"."employee_type_employee_type_id_seq"', 6, true);
SELECT setval('"public"."industry_type_industry_type_id_seq"', 3, true);
SELECT setval('"public"."invoice_detail_invoice_detail_id_seq"', 2, false);
SELECT setval('"public"."invoice_invoice_id_seq"', 2, false);
ALTER SEQUENCE "public"."items_id_seq"
OWNED BY "public"."items"."id";
SELECT setval('"public"."items_id_seq"', 2, false);
SELECT setval('"public"."log_history_log_history_id_seq"', 2, false);
SELECT setval('"public"."log_login_fail_log_login_fail_id_seq"', 1111, true);
SELECT setval('"public"."log_login_log_login_id_seq"', 4112, true);
SELECT setval('"public"."lph_lph_id_seq"', 41, true);
ALTER SEQUENCE "public"."menu_menu_id_seq"
OWNED BY "public"."menu"."menu_id";
SELECT setval('"public"."menu_menu_id_seq"', 2, false);
ALTER SEQUENCE "public"."migrations_id_seq"
OWNED BY "public"."migrations"."id";
SELECT setval('"public"."migrations_id_seq"', 2, false);
SELECT setval('"public"."notification_msg_notification_msg_id_seq"', 2495, true);
SELECT setval('"public"."notification_token_notification_token_id_seq"', 415, true);
SELECT setval('"public"."package_price_package_price_id_seq"', 515303, true);
SELECT setval('"public"."package_price_special_package_price_special_id_seq"', 2, true);
SELECT setval('"public"."package_type_package_type_id_seq"', 6, true);
SELECT setval('"public"."partner_logistic_partner_logistic_id_seq"', 6, true);
SELECT setval('"public"."partner_partner_id_seq"', 2, false);
SELECT setval('"public"."payment_method_payment_method_id_seq"', 5, true);
SELECT setval('"public"."pickup_request_detail_pickup_request_detail_id_seq"', 1734899, true);
SELECT setval('"public"."pickup_request_invalid_pickup_request_invalid_id_seq"', 3177565, true);
SELECT setval('"public"."pickup_request_log_pickup_request_log_id_seq"', 13, true);
SELECT setval('"public"."pickup_request_pickup_request_id_seq"', 1779021, true);
SELECT setval('"public"."pickup_request_upload_detail_pickup_request_upload_detail_id_se"', 4571, true);
SELECT setval('"public"."pickup_request_upload_pickup_request_upload_id_seq"', 4575, true);
SELECT setval('"public"."place_place_id_seq"', 898, true);
SELECT setval('"public"."place_type_place_type_id_seq"', 2, false);
SELECT setval('"public"."pod_scan_in_pod_scan_in_id_seq"', 2, false);
SELECT setval('"public"."pod_scan_pod_scan_id_seq"', 83, true);
SELECT setval('"public"."price_list_price_list_id_seq"', 37, true);
SELECT setval('"public"."province_province_id_seq"', 35, true);
SELECT setval('"public"."reason_reason_id_seq"', 38, true);
SELECT setval('"public"."received_package_detail_received_package_detail_id_seq"', 66, true);
SELECT setval('"public"."received_package_received_package_id_seq"', 31, true);
SELECT setval('"public"."representative_representative_id_seq"', 98, true);
SELECT setval('"public"."reseller_reseller_id_seq"', 2, false);
SELECT setval('"public"."role_permission_access_role_permission_access_id"', 5, true);
SELECT setval('"public"."role_permission_dashboard_role_permission_dashboard_id_seq"', 21, true);
ALTER SEQUENCE "public"."role_permission_role_permission_id_seq"
OWNED BY "public"."role_permission"."role_permission_id";
SELECT setval('"public"."role_permission_role_permission_id_seq"', 6675, true);
ALTER SEQUENCE "public"."role_role_id_seq"
OWNED BY "public"."role"."role_id";
SELECT setval('"public"."role_role_id_seq"', 56, true);
SELECT setval('"public"."smu_item_smu_item_id_seq"', 12982, true);
SELECT setval('"public"."smu_load_smu_load_id_seq"', 6, true);
SELECT setval('"public"."smu_smu_id_seq"', 2096, true);
SELECT setval('"public"."social_media_social_media_id_seq"', 3, true);
SELECT setval('"public"."sync_awb_file_sync_awb_file_id_seq"', 248294, true);
SELECT setval('"public"."sync_awb_sync_awb_id_seq"', 13274, true);
SELECT setval('"public"."sync_master_history_sync_master_history_id_seq"', 3519, true);
SELECT setval('"public"."sync_master_sync_master_id_seq"', 378719, true);
SELECT setval('"public"."sys_counter_sys_counter_id_seq"', 79, true);
ALTER SEQUENCE "public"."todos_id_seq"
OWNED BY "public"."todos"."id";
SELECT setval('"public"."todos_id_seq"', 2, false);
ALTER SEQUENCE "public"."user_api_id_seq"
OWNED BY "public"."user_api"."id";
SELECT setval('"public"."user_api_id_seq"', 2, true);
SELECT setval('"public"."user_notification_msg_user_notification_msg_id_seq"', 3308, true);
SELECT setval('"public"."user_role_user_role_id_seq"', 3119, true);
ALTER SEQUENCE "public"."user_user_id_seq"
OWNED BY "public"."users"."user_id";
SELECT setval('"public"."user_user_id_seq"', 184, true);
SELECT setval('"public"."work_order_detail_work_order_detail_id_seq"', 20476, true);
SELECT setval('"public"."work_order_history_work_order_history_id_seq"', 97308, true);
SELECT setval('"public"."work_order_schedule_work_order_schedule_id_seq"', 8, true);
SELECT setval('"public"."work_order_status_work_order_status_id_seq"', 2, false);
SELECT setval('"public"."work_order_work_order_id_seq"', 21509, true);
SELECT setval('"public"."zone_zone_id_seq"', 5, true);

-- ----------------------------
-- Primary Key structure for table airline
-- ----------------------------
ALTER TABLE "public"."airline" ADD CONSTRAINT "airline_pkey" PRIMARY KEY ("airline_id");

-- ----------------------------
-- Primary Key structure for table airport
-- ----------------------------
ALTER TABLE "public"."airport" ADD CONSTRAINT "airport_pkey" PRIMARY KEY ("airport_id");

-- ----------------------------
-- Primary Key structure for table ar_internal_metadata
-- ----------------------------
ALTER TABLE "public"."ar_internal_metadata" ADD CONSTRAINT "ar_internal_metadata_pkey" PRIMARY KEY ("key");

-- ----------------------------
-- Primary Key structure for table attachment
-- ----------------------------
ALTER TABLE "public"."attachment" ADD CONSTRAINT "attachment_pkey" PRIMARY KEY ("attachment_id");

-- ----------------------------
-- Primary Key structure for table attachment_tms
-- ----------------------------
ALTER TABLE "public"."attachment_tms" ADD CONSTRAINT "attachment_tms_pkey" PRIMARY KEY ("attachment_tms_id");

-- ----------------------------
-- Indexes structure for table awb
-- ----------------------------
CREATE INDEX "awb_awb_date_idx" ON "public"."awb" USING btree (
  "awb_date" "pg_catalog"."timestamp_ops" ASC NULLS LAST,
  "is_deleted" "pg_catalog"."bool_ops" DESC NULLS LAST
);
CREATE INDEX "awb_awb_list_idx" ON "public"."awb" USING btree (
  "awb_date" "pg_catalog"."timestamp_ops" DESC NULLS LAST,
  "is_deleted" "pg_catalog"."bool_ops" DESC NULLS LAST
);
CREATE INDEX "awb_awb_number_idx" ON "public"."awb" USING btree (
  "awb_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "awb_awb_status_id_last_idx" ON "public"."awb" USING btree (
  "awb_status_id_last" "pg_catalog"."int4_ops" DESC NULLS LAST
);
CREATE INDEX "awb_booking_idx" ON "public"."awb" USING btree (
  "awb_booking_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "awb_branch_id_last_idx" ON "public"."awb" USING btree (
  "branch_id_last" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "awb_customer_account_id_idx" ON "public"."awb" USING btree (
  "customer_account_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "awb_from_id_idx" ON "public"."awb" USING btree (
  "from_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "awb_from_type_idx" ON "public"."awb" USING btree (
  "from_type" "pg_catalog"."int4_ops" DESC NULLS LAST
);
CREATE INDEX "awb_is_deleted_idx" ON "public"."awb" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "awb_package_type_id_idx" ON "public"."awb" USING btree (
  "package_type_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "awb_to_id_idx" ON "public"."awb" USING btree (
  "to_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "awb_to_type_idx" ON "public"."awb" USING btree (
  "to_type" "pg_catalog"."int4_ops" DESC NULLS LAST
);
CREATE INDEX "awb_updated_time_idx" ON "public"."awb" USING brin (
  "updated_time" "pg_catalog"."timestamp_minmax_ops"
);

-- ----------------------------
-- Primary Key structure for table awb
-- ----------------------------
ALTER TABLE "public"."awb" ADD CONSTRAINT "awb_pkey" PRIMARY KEY ("awb_id");

-- ----------------------------
-- Primary Key structure for table awb_attr
-- ----------------------------
ALTER TABLE "public"."awb_attr" ADD CONSTRAINT "awb_attr_pkey" PRIMARY KEY ("awb_attr_id");

-- ----------------------------
-- Indexes structure for table awb_booking
-- ----------------------------
CREATE UNIQUE INDEX "awb_number_idx" ON "public"."awb_booking" USING btree (
  "awb_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table awb_booking
-- ----------------------------
ALTER TABLE "public"."awb_booking" ADD CONSTRAINT "awb_number_uniq" UNIQUE ("awb_number");

-- ----------------------------
-- Primary Key structure for table awb_booking
-- ----------------------------
ALTER TABLE "public"."awb_booking" ADD CONSTRAINT "awb_booking_pkey" PRIMARY KEY ("awb_booking_id");

-- ----------------------------
-- Primary Key structure for table awb_booking_status
-- ----------------------------
ALTER TABLE "public"."awb_booking_status" ADD CONSTRAINT "awb_booking_status_pkey" PRIMARY KEY ("awb_booking_status_id");

-- ----------------------------
-- Primary Key structure for table awb_detail
-- ----------------------------
ALTER TABLE "public"."awb_detail" ADD CONSTRAINT "awb_detail_pkey" PRIMARY KEY ("awb_detail_id");

-- ----------------------------
-- Indexes structure for table awb_history
-- ----------------------------
CREATE INDEX "awb_history_item_idx" ON "public"."awb_history" USING btree (
  "awb_item_id" "pg_catalog"."int8_ops" ASC NULLS FIRST
);
CREATE INDEX "awb_history_status_idx" ON "public"."awb_history" USING btree (
  "awb_status_id" "pg_catalog"."int8_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table awb_history
-- ----------------------------
ALTER TABLE "public"."awb_history" ADD CONSTRAINT "awb_history_pkey" PRIMARY KEY ("awb_history_id");

-- ----------------------------
-- Primary Key structure for table awb_invalid
-- ----------------------------
ALTER TABLE "public"."awb_invalid" ADD CONSTRAINT "awb_invalid_pkey" PRIMARY KEY ("awb_invalid_id");

-- ----------------------------
-- Indexes structure for table awb_item
-- ----------------------------
CREATE INDEX "awb_item_awb_id_idx" ON "public"."awb_item" USING btree (
  "awb_id" "pg_catalog"."int8_ops" DESC NULLS LAST,
  "is_deleted" "pg_catalog"."bool_ops" DESC NULLS LAST
);
CREATE INDEX "awb_item_is_deleted_idx" ON "public"."awb_item" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table awb_item
-- ----------------------------
ALTER TABLE "public"."awb_item" ADD CONSTRAINT "awb_item_pkey" PRIMARY KEY ("awb_item_id");

-- ----------------------------
-- Primary Key structure for table awb_item_attr
-- ----------------------------
ALTER TABLE "public"."awb_item_attr" ADD CONSTRAINT "awb_item_attr_pkey" PRIMARY KEY ("awb_item_attr_id");

-- ----------------------------
-- Indexes structure for table awb_item_summary
-- ----------------------------
CREATE INDEX "awb_item_summary_awb_item_idx" ON "public"."awb_item_summary" USING btree (
  "awb_item_id" "pg_catalog"."int8_ops" DESC NULLS FIRST
);
CREATE INDEX "awb_item_summary_is_deleted_idx" ON "public"."awb_item_summary" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "awb_item_summary_summary_date_idx" ON "public"."awb_item_summary" USING brin (
  "summary_date" "pg_catalog"."timestamp_minmax_ops"
);

-- ----------------------------
-- Primary Key structure for table awb_item_summary
-- ----------------------------
ALTER TABLE "public"."awb_item_summary" ADD CONSTRAINT "awb_item_summary_pkey" PRIMARY KEY ("awb_item_summary_id");

-- ----------------------------
-- Indexes structure for table awb_price
-- ----------------------------
CREATE INDEX "awb_price_awb_date_idx" ON "public"."awb_price" USING btree (
  "awb_date" "pg_catalog"."timestamp_ops" DESC NULLS LAST
);
CREATE INDEX "awb_price_awb_number_idx" ON "public"."awb_price" USING btree (
  "awb_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" DESC NULLS LAST
);
CREATE INDEX "awb_price_customer_account_id_idx" ON "public"."awb_price" USING btree (
  "customer_account_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "awb_price_from_to_id_idx" ON "public"."awb_price" USING btree (
  "from_id" "pg_catalog"."int8_ops" DESC NULLS LAST,
  "to_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "awb_price_updated_time_idx" ON "public"."awb_price" USING btree (
  "updated_time" "pg_catalog"."timestamp_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table awb_price
-- ----------------------------
ALTER TABLE "public"."awb_price" ADD CONSTRAINT "awb_price_pkey" PRIMARY KEY ("awb_price_id");

-- ----------------------------
-- Indexes structure for table awb_price_item
-- ----------------------------
CREATE INDEX "awb_price_item_awb_item_id_idx" ON "public"."awb_price_item" USING btree (
  "awb_item_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "awb_price_item_awb_price_id_idx" ON "public"."awb_price_item" USING btree (
  "awb_price_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "awb_price_item_updated_time_idx" ON "public"."awb_price_item" USING btree (
  "updated_time" "pg_catalog"."timestamp_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table awb_price_item
-- ----------------------------
ALTER TABLE "public"."awb_price_item" ADD CONSTRAINT "awb_price_item_pkey" PRIMARY KEY ("awb_price_item_id");

-- ----------------------------
-- Primary Key structure for table awb_request
-- ----------------------------
ALTER TABLE "public"."awb_request" ADD CONSTRAINT "awb_request_pkey" PRIMARY KEY ("awb_request_id");

-- ----------------------------
-- Primary Key structure for table awb_solution
-- ----------------------------
ALTER TABLE "public"."awb_solution" ADD CONSTRAINT "awb_solution_id_pkey" PRIMARY KEY ("awb_solution_id");

-- ----------------------------
-- Primary Key structure for table awb_status
-- ----------------------------
ALTER TABLE "public"."awb_status" ADD CONSTRAINT "awb_status_pkey" PRIMARY KEY ("awb_status_id");

-- ----------------------------
-- Primary Key structure for table awb_status_group
-- ----------------------------
ALTER TABLE "public"."awb_status_group" ADD CONSTRAINT "awb_status_group_pkey" PRIMARY KEY ("awb_status_group_id");

-- ----------------------------
-- Primary Key structure for table awb_status_group_item
-- ----------------------------
ALTER TABLE "public"."awb_status_group_item" ADD CONSTRAINT "awb_status_group_item_pkey" PRIMARY KEY ("awb_status_group_item_id");

-- ----------------------------
-- Primary Key structure for table awb_track
-- ----------------------------
ALTER TABLE "public"."awb_track" ADD CONSTRAINT "awb_track_pkey" PRIMARY KEY ("awb_track_id");

-- ----------------------------
-- Primary Key structure for table awb_trouble
-- ----------------------------
ALTER TABLE "public"."awb_trouble" ADD CONSTRAINT "awb_trouble_pkey" PRIMARY KEY ("awb_trouble_id");

-- ----------------------------
-- Primary Key structure for table awb_trouble_status
-- ----------------------------
ALTER TABLE "public"."awb_trouble_status" ADD CONSTRAINT "awb_trouble_status_pkey" PRIMARY KEY ("awb_trouble_status_id");

-- ----------------------------
-- Indexes structure for table bag
-- ----------------------------
CREATE INDEX "bag_bag_date_idx" ON "public"."bag" USING btree (
  "bag_date" "pg_catalog"."date_ops" ASC NULLS LAST
);
CREATE INDEX "bag_bag_number_idx" ON "public"."bag" USING btree (
  "bag_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "bag_branch_id_idx" ON "public"."bag" USING btree (
  "branch_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "bag_created_time_idx" ON "public"."bag" USING btree (
  "created_time" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "bag_is_deleted_idx" ON "public"."bag" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table bag
-- ----------------------------
ALTER TABLE "public"."bag" ADD CONSTRAINT "bag_pkey" PRIMARY KEY ("bag_id");

-- ----------------------------
-- Indexes structure for table bag_item
-- ----------------------------
CREATE INDEX "bag_item_bag_id_idx" ON "public"."bag_item" USING btree (
  "bag_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "bag_item_bag_seq_idx" ON "public"."bag_item" USING btree (
  "bag_seq" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "bag_item_is_deleted_idx" ON "public"."bag_item" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table bag_item
-- ----------------------------
ALTER TABLE "public"."bag_item" ADD CONSTRAINT "bag_item_pkey" PRIMARY KEY ("bag_item_id");

-- ----------------------------
-- Indexes structure for table bag_item_awb
-- ----------------------------
CREATE INDEX "bag_item_awb_awb_item_idx" ON "public"."bag_item_awb" USING btree (
  "awb_item_id" "pg_catalog"."int8_ops" ASC NULLS FIRST
);
CREATE INDEX "bag_item_awb_awb_number_idx" ON "public"."bag_item_awb" USING btree (
  "awb_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "bag_item_awb_bag_item_id_idx" ON "public"."bag_item_awb" USING btree (
  "bag_item_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "bag_item_awb_is_deleted_idx" ON "public"."bag_item_awb" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table bag_item_awb
-- ----------------------------
ALTER TABLE "public"."bag_item_awb" ADD CONSTRAINT "bag_item_awb_pkey" PRIMARY KEY ("bag_item_awb_id");

-- ----------------------------
-- Primary Key structure for table bag_item_history
-- ----------------------------
ALTER TABLE "public"."bag_item_history" ADD CONSTRAINT "bag_item_history_pkey" PRIMARY KEY ("bag_item_history_id");

-- ----------------------------
-- Primary Key structure for table bag_item_status
-- ----------------------------
ALTER TABLE "public"."bag_item_status" ADD CONSTRAINT "bag_item_status_pkey" PRIMARY KEY ("bag_item_status_id");

-- ----------------------------
-- Primary Key structure for table bag_solution
-- ----------------------------
ALTER TABLE "public"."bag_solution" ADD CONSTRAINT "bag_solution_id_pkey" PRIMARY KEY ("bag_solution_id");

-- ----------------------------
-- Primary Key structure for table bag_trouble
-- ----------------------------
ALTER TABLE "public"."bag_trouble" ADD CONSTRAINT "bag_trouble_id_pkey" PRIMARY KEY ("bag_trouble_id");

-- ----------------------------
-- Indexes structure for table bagging
-- ----------------------------
CREATE INDEX "bagging_representative_id_to_idx" ON "public"."bagging" USING btree (
  "representative_id_to" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "bagging_smu_id_last_idx" ON "public"."bagging" USING btree (
  "smu_id_last" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table bagging
-- ----------------------------
ALTER TABLE "public"."bagging" ADD CONSTRAINT "bagging_pkey" PRIMARY KEY ("bagging_id");

-- ----------------------------
-- Primary Key structure for table bagging_item
-- ----------------------------
ALTER TABLE "public"."bagging_item" ADD CONSTRAINT "bagging_item_pkey" PRIMARY KEY ("bagging_item_id");

-- ----------------------------
-- Primary Key structure for table bank
-- ----------------------------
ALTER TABLE "public"."bank" ADD CONSTRAINT "bank_pkey" PRIMARY KEY ("bank_id");

-- ----------------------------
-- Primary Key structure for table bank_branch
-- ----------------------------
ALTER TABLE "public"."bank_branch" ADD CONSTRAINT "bank_branch_pkey" PRIMARY KEY ("bank_branch_id");

-- ----------------------------
-- Primary Key structure for table branch
-- ----------------------------
ALTER TABLE "public"."branch" ADD CONSTRAINT "branch_pkey" PRIMARY KEY ("branch_id");

-- ----------------------------
-- Primary Key structure for table branch_region
-- ----------------------------
ALTER TABLE "public"."branch_region" ADD CONSTRAINT "branch_region_pkey" PRIMARY KEY ("branch_region_id");

-- ----------------------------
-- Primary Key structure for table branch_software
-- ----------------------------
ALTER TABLE "public"."branch_software" ADD CONSTRAINT "branch_software_pkey" PRIMARY KEY ("branch_software_id");

-- ----------------------------
-- Primary Key structure for table calculation_discount
-- ----------------------------
ALTER TABLE "public"."calculation_discount" ADD CONSTRAINT "calculation_discount_pkey" PRIMARY KEY ("calculation_discount_id");

-- ----------------------------
-- Primary Key structure for table calculation_discount_history
-- ----------------------------
ALTER TABLE "public"."calculation_discount_history" ADD CONSTRAINT "calculation_discount_history_pkey" PRIMARY KEY ("calculation_discount_history_id");

-- ----------------------------
-- Primary Key structure for table city
-- ----------------------------
ALTER TABLE "public"."city" ADD CONSTRAINT "city_pkey" PRIMARY KEY ("city_id");

-- ----------------------------
-- Primary Key structure for table cms_option
-- ----------------------------
ALTER TABLE "public"."cms_option" ADD CONSTRAINT "cms_option_pkey" PRIMARY KEY ("cms_option_id");

-- ----------------------------
-- Primary Key structure for table country
-- ----------------------------
ALTER TABLE "public"."country" ADD CONSTRAINT "country_pkey" PRIMARY KEY ("country_id");

-- ----------------------------
-- Primary Key structure for table customer
-- ----------------------------
ALTER TABLE "public"."customer" ADD CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id");

-- ----------------------------
-- Indexes structure for table customer_account
-- ----------------------------
CREATE INDEX "code_rds_idx" ON "public"."customer_account" USING btree (
  "code_rds" "pg_catalog"."jsonb_ops" ASC NULLS LAST
);
CREATE INDEX "customer_account_is_email_at_night_idx" ON "public"."customer_account" USING btree (
  "is_email_at_night" "pg_catalog"."bool_ops" DESC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table customer_account
-- ----------------------------
ALTER TABLE "public"."customer_account" ADD CONSTRAINT "customer_account_customer_account_code_key" UNIQUE ("customer_account_code");

-- ----------------------------
-- Primary Key structure for table customer_account
-- ----------------------------
ALTER TABLE "public"."customer_account" ADD CONSTRAINT "customer_account_pkey" PRIMARY KEY ("customer_account_id");

-- ----------------------------
-- Primary Key structure for table customer_account_change
-- ----------------------------
ALTER TABLE "public"."customer_account_change" ADD CONSTRAINT "customer_account_change_pkey" PRIMARY KEY ("customer_account_change_id");

-- ----------------------------
-- Uniques structure for table customer_account_merchant
-- ----------------------------
ALTER TABLE "public"."customer_account_merchant" ADD CONSTRAINT "customer_account_merchant_customer_account_merchant_code_key" UNIQUE ("customer_account_merchant_code");

-- ----------------------------
-- Primary Key structure for table customer_account_merchant
-- ----------------------------
ALTER TABLE "public"."customer_account_merchant" ADD CONSTRAINT "customer_account_merchant_pkey" PRIMARY KEY ("customer_account_merchant_id");

-- ----------------------------
-- Primary Key structure for table customer_account_post_history
-- ----------------------------
ALTER TABLE "public"."customer_account_post_history" ADD CONSTRAINT "customer_account_post_history_pkey" PRIMARY KEY ("customer_account_post_history_id");

-- ----------------------------
-- Primary Key structure for table customer_address
-- ----------------------------
ALTER TABLE "public"."customer_address" ADD CONSTRAINT "customer_address_pkey" PRIMARY KEY ("customer_address_id");

-- ----------------------------
-- Primary Key structure for table customer_bank
-- ----------------------------
ALTER TABLE "public"."customer_bank" ADD CONSTRAINT "customer_bank_pkey" PRIMARY KEY ("customer_bank_id");

-- ----------------------------
-- Primary Key structure for table customer_bank_change
-- ----------------------------
ALTER TABLE "public"."customer_bank_change" ADD CONSTRAINT "customer_bank_change_pkey" PRIMARY KEY ("customer_bank_change_id");

-- ----------------------------
-- Primary Key structure for table customer_category
-- ----------------------------
ALTER TABLE "public"."customer_category" ADD CONSTRAINT "customer_category_pkey" PRIMARY KEY ("customer_category_id");

-- ----------------------------
-- Primary Key structure for table customer_grade
-- ----------------------------
ALTER TABLE "public"."customer_grade" ADD CONSTRAINT "customer_grade_pkey" PRIMARY KEY ("customer_grade_id");

-- ----------------------------
-- Indexes structure for table customer_meta
-- ----------------------------
CREATE INDEX "index_meta_key" ON "public"."customer_meta" USING btree (
  "meta_key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table customer_meta
-- ----------------------------
ALTER TABLE "public"."customer_meta" ADD CONSTRAINT "customer_meta_pkey" PRIMARY KEY ("customer_meta_id");

-- ----------------------------
-- Primary Key structure for table customer_meta_change
-- ----------------------------
ALTER TABLE "public"."customer_meta_change" ADD CONSTRAINT "customer_meta_change_pkey" PRIMARY KEY ("customer_meta_change_id");

-- ----------------------------
-- Primary Key structure for table customer_pickup
-- ----------------------------
ALTER TABLE "public"."customer_pickup" ADD CONSTRAINT "customer_pickup_pkey" PRIMARY KEY ("customer_pickup_id");

-- ----------------------------
-- Primary Key structure for table department
-- ----------------------------
ALTER TABLE "public"."department" ADD CONSTRAINT "department_pkey" PRIMARY KEY ("department_id");

-- ----------------------------
-- Indexes structure for table detail_email_at_night
-- ----------------------------
CREATE INDEX "dean_customer_account_id_idx" ON "public"."detail_email_at_night" USING btree (
  "customer_account_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "dean_email_at_night_id_idx" ON "public"."detail_email_at_night" USING btree (
  "email_at_night_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "dean_status_email_idx" ON "public"."detail_email_at_night" USING btree (
  "status_email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table detail_email_at_night
-- ----------------------------
ALTER TABLE "public"."detail_email_at_night" ADD CONSTRAINT "detail_email_at_night_pkey" PRIMARY KEY ("detail_email_at_night_id");

-- ----------------------------
-- Indexes structure for table detail_lph
-- ----------------------------
CREATE INDEX "detail_lph_customer_account_id_idx" ON "public"."detail_lph" USING btree (
  "customer_account_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "detail_lph_lph_id_idx" ON "public"."detail_lph" USING btree (
  "lph_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "detail_lph_status_email_idx" ON "public"."detail_lph" USING btree (
  "status_email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table detail_lph
-- ----------------------------
ALTER TABLE "public"."detail_lph" ADD CONSTRAINT "detail_lph_pkey" PRIMARY KEY ("detail_lph_id");

-- ----------------------------
-- Primary Key structure for table district
-- ----------------------------
ALTER TABLE "public"."district" ADD CONSTRAINT "district_pkey" PRIMARY KEY ("district_id");

-- ----------------------------
-- Primary Key structure for table district_reference
-- ----------------------------
ALTER TABLE "public"."district_reference" ADD CONSTRAINT "district_reference_pkey" PRIMARY KEY ("district_reference_id");

-- ----------------------------
-- Primary Key structure for table division
-- ----------------------------
ALTER TABLE "public"."division" ADD CONSTRAINT "division_pkey" PRIMARY KEY ("division_id");

-- ----------------------------
-- Primary Key structure for table division_department
-- ----------------------------
ALTER TABLE "public"."division_department" ADD CONSTRAINT "division_department_pkey" PRIMARY KEY ("division_department_id");

-- ----------------------------
-- Primary Key structure for table do_pickup
-- ----------------------------
ALTER TABLE "public"."do_pickup" ADD CONSTRAINT "do_pickup_pkey" PRIMARY KEY ("do_pickup_id");

-- ----------------------------
-- Indexes structure for table do_pickup_detail
-- ----------------------------
CREATE INDEX "do_pickup_detail_work_order_id_idx" ON "public"."do_pickup_detail" USING btree (
  "work_order_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table do_pickup_detail
-- ----------------------------
ALTER TABLE "public"."do_pickup_detail" ADD CONSTRAINT "do_pickup_detail_pkey" PRIMARY KEY ("do_pickup_detail_id");

-- ----------------------------
-- Primary Key structure for table do_pod
-- ----------------------------
ALTER TABLE "public"."do_pod" ADD CONSTRAINT "do_pod_pkey" PRIMARY KEY ("do_pod_id");

-- ----------------------------
-- Primary Key structure for table do_pod_deliver
-- ----------------------------
ALTER TABLE "public"."do_pod_deliver" ADD CONSTRAINT "do_pod_deliver_pkey" PRIMARY KEY ("do_pod_deliver_id");

-- ----------------------------
-- Primary Key structure for table do_pod_deliver_detail
-- ----------------------------
ALTER TABLE "public"."do_pod_deliver_detail" ADD CONSTRAINT "do_pod_deliver_detail_pkey" PRIMARY KEY ("do_pod_deliver_detail_id");

-- ----------------------------
-- Primary Key structure for table do_pod_deliver_history
-- ----------------------------
ALTER TABLE "public"."do_pod_deliver_history" ADD CONSTRAINT "do_pod_deliver_history_pkey" PRIMARY KEY ("do_pod_deliver_history_id");

-- ----------------------------
-- Primary Key structure for table do_pod_detail
-- ----------------------------
ALTER TABLE "public"."do_pod_detail" ADD CONSTRAINT "do_pod_detail_pkey" PRIMARY KEY ("do_pod_detail_id");

-- ----------------------------
-- Primary Key structure for table do_pod_history
-- ----------------------------
ALTER TABLE "public"."do_pod_history" ADD CONSTRAINT "do_pod_history_pkey" PRIMARY KEY ("do_pod_history_id");

-- ----------------------------
-- Primary Key structure for table do_pod_status
-- ----------------------------
ALTER TABLE "public"."do_pod_status" ADD CONSTRAINT "do_pod_status_pkey" PRIMARY KEY ("do_pod_status_id");

-- ----------------------------
-- Primary Key structure for table do_smu
-- ----------------------------
ALTER TABLE "public"."do_smu" ADD CONSTRAINT "do_smu_pkey" PRIMARY KEY ("do_smu_id");

-- ----------------------------
-- Primary Key structure for table do_smu_detail
-- ----------------------------
ALTER TABLE "public"."do_smu_detail" ADD CONSTRAINT "do_smu_detail_pkey" PRIMARY KEY ("do_smu_detail_id");

-- ----------------------------
-- Primary Key structure for table do_smu_history
-- ----------------------------
ALTER TABLE "public"."do_smu_history" ADD CONSTRAINT "do_smu_history_pkey" PRIMARY KEY ("do_smu_history_id");

-- ----------------------------
-- Primary Key structure for table do_smu_status
-- ----------------------------
ALTER TABLE "public"."do_smu_status" ADD CONSTRAINT "do_smu_status_pkey" PRIMARY KEY ("do_smu_status_id");

-- ----------------------------
-- Primary Key structure for table do_work_order
-- ----------------------------
ALTER TABLE "public"."do_work_order" ADD CONSTRAINT "do_work_order_pkey" PRIMARY KEY ("do_work_order_id");

-- ----------------------------
-- Primary Key structure for table do_work_order_detail
-- ----------------------------
ALTER TABLE "public"."do_work_order_detail" ADD CONSTRAINT "do_work_order_detail_pkey" PRIMARY KEY ("do_work_order_detail_id");

-- ----------------------------
-- Indexes structure for table email_at_night
-- ----------------------------
CREATE INDEX "ean_awb_date_idx" ON "public"."email_at_night" USING btree (
  "awb_date" "pg_catalog"."timestamp_ops" DESC NULLS LAST
);
CREATE INDEX "ean_updated_time_idx" ON "public"."email_at_night" USING btree (
  "updated_time" "pg_catalog"."timestamp_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table email_at_night
-- ----------------------------
ALTER TABLE "public"."email_at_night" ADD CONSTRAINT "email_at_night_pkey" PRIMARY KEY ("email_at_night_id");

-- ----------------------------
-- Primary Key structure for table email_log
-- ----------------------------
ALTER TABLE "public"."email_log" ADD CONSTRAINT "email_log_pkey" PRIMARY KEY ("email_log_id");

-- ----------------------------
-- Primary Key structure for table email_log_history
-- ----------------------------
ALTER TABLE "public"."email_log_history" ADD CONSTRAINT "email_log_history_pkey" PRIMARY KEY ("email_log_history_id");

-- ----------------------------
-- Primary Key structure for table employee
-- ----------------------------
ALTER TABLE "public"."employee" ADD CONSTRAINT "employee_pkey" PRIMARY KEY ("employee_id");

-- ----------------------------
-- Primary Key structure for table employee_education
-- ----------------------------
ALTER TABLE "public"."employee_education" ADD CONSTRAINT "employee_education_pkey" PRIMARY KEY ("employee_education_id");

-- ----------------------------
-- Primary Key structure for table employee_experience
-- ----------------------------
ALTER TABLE "public"."employee_experience" ADD CONSTRAINT "employee_experience_pkey" PRIMARY KEY ("employee_experience_id");

-- ----------------------------
-- Primary Key structure for table employee_family
-- ----------------------------
ALTER TABLE "public"."employee_family" ADD CONSTRAINT "employee_family_pkey" PRIMARY KEY ("employee_family_id");

-- ----------------------------
-- Primary Key structure for table employee_journey
-- ----------------------------
ALTER TABLE "public"."employee_journey" ADD CONSTRAINT "employee_journey_id_pkey" PRIMARY KEY ("employee_journey_id");

-- ----------------------------
-- Primary Key structure for table employee_role
-- ----------------------------
ALTER TABLE "public"."employee_role" ADD CONSTRAINT "employee_role_pkey" PRIMARY KEY ("employee_role_id");

-- ----------------------------
-- Primary Key structure for table employee_source
-- ----------------------------
ALTER TABLE "public"."employee_source" ADD CONSTRAINT "employee_source_pkey" PRIMARY KEY ("employee_source_id");

-- ----------------------------
-- Primary Key structure for table employee_type
-- ----------------------------
ALTER TABLE "public"."employee_type" ADD CONSTRAINT "employee_type_pkey" PRIMARY KEY ("employee_type_id");

-- ----------------------------
-- Primary Key structure for table industry_type
-- ----------------------------
ALTER TABLE "public"."industry_type" ADD CONSTRAINT "industry_type_pkey" PRIMARY KEY ("industry_type_id");

-- ----------------------------
-- Primary Key structure for table invoice
-- ----------------------------
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_pkey" PRIMARY KEY ("invoice_id");

-- ----------------------------
-- Primary Key structure for table invoice_detail
-- ----------------------------
ALTER TABLE "public"."invoice_detail" ADD CONSTRAINT "invoice_detail_pkey" PRIMARY KEY ("invoice_detail_id");

-- ----------------------------
-- Indexes structure for table items
-- ----------------------------
CREATE INDEX "index_items_on_todo_id" ON "public"."items" USING btree (
  "todo_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table items
-- ----------------------------
ALTER TABLE "public"."items" ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table log_history
-- ----------------------------
ALTER TABLE "public"."log_history" ADD CONSTRAINT "log_divison_pkey" PRIMARY KEY ("log_history_id");

-- ----------------------------
-- Primary Key structure for table log_login
-- ----------------------------
ALTER TABLE "public"."log_login" ADD CONSTRAINT "log_login_pkey" PRIMARY KEY ("log_login_id");

-- ----------------------------
-- Primary Key structure for table log_login_fail
-- ----------------------------
ALTER TABLE "public"."log_login_fail" ADD CONSTRAINT "log_login_fail_pkey" PRIMARY KEY ("log_login_fail_id");

-- ----------------------------
-- Indexes structure for table lph
-- ----------------------------
CREATE INDEX "lph_awb_date_idx" ON "public"."lph" USING btree (
  "awb_date" "pg_catalog"."timestamp_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table lph
-- ----------------------------
ALTER TABLE "public"."lph" ADD CONSTRAINT "lph_pkey" PRIMARY KEY ("lph_id");

-- ----------------------------
-- Primary Key structure for table menu
-- ----------------------------
ALTER TABLE "public"."menu" ADD CONSTRAINT "menu_pkey" PRIMARY KEY ("menu_id");

-- ----------------------------
-- Primary Key structure for table migrations
-- ----------------------------
ALTER TABLE "public"."migrations" ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table notification_msg
-- ----------------------------
ALTER TABLE "public"."notification_msg" ADD CONSTRAINT "notification_msg_pkey" PRIMARY KEY ("notification_msg_id");

-- ----------------------------
-- Primary Key structure for table notification_token
-- ----------------------------
ALTER TABLE "public"."notification_token" ADD CONSTRAINT "notification_token_pkey" PRIMARY KEY ("notification_token_id");

-- ----------------------------
-- Indexes structure for table package_price
-- ----------------------------
CREATE INDEX "package_price_from_id_idx" ON "public"."package_price" USING btree (
  "from_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "package_price_from_type_idx" ON "public"."package_price" USING btree (
  "from_type" "pg_catalog"."int4_ops" DESC NULLS LAST
);
CREATE INDEX "package_price_package_type_id_idx" ON "public"."package_price" USING btree (
  "package_type_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "package_price_to_id_idx" ON "public"."package_price" USING btree (
  "to_id" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "package_price_to_type_idx" ON "public"."package_price" USING btree (
  "to_type" "pg_catalog"."int4_ops" DESC NULLS LAST
);
CREATE INDEX "package_price_updated_time_idx" ON "public"."package_price" USING btree (
  "updated_time" "pg_catalog"."timestamp_ops" DESC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table package_price
-- ----------------------------
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key1" UNIQUE ("package_type_id", "country_id_from", "country_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key10" UNIQUE ("package_type_id", "city_id_from", "province_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key11" UNIQUE ("package_type_id", "city_id_from", "city_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key12" UNIQUE ("package_type_id", "city_id_from", "district_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key13" UNIQUE ("package_type_id", "district_id_from", "country_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key14" UNIQUE ("package_type_id", "district_id_from", "province_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key15" UNIQUE ("package_type_id", "district_id_from", "city_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key16" UNIQUE ("package_type_id", "district_id_from", "district_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key2" UNIQUE ("package_type_id", "country_id_from", "province_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key3" UNIQUE ("package_type_id", "country_id_from", "city_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key4" UNIQUE ("package_type_id", "country_id_from", "district_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key5" UNIQUE ("package_type_id", "province_id_from", "country_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key6" UNIQUE ("package_type_id", "province_id_from", "province_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key7" UNIQUE ("package_type_id", "province_id_from", "city_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key8" UNIQUE ("package_type_id", "province_id_from", "district_id_to");
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_unique_key9" UNIQUE ("package_type_id", "city_id_from", "country_id_to");

-- ----------------------------
-- Primary Key structure for table package_price
-- ----------------------------
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_pkey" PRIMARY KEY ("package_price_id");

-- ----------------------------
-- Uniques structure for table package_price_special
-- ----------------------------
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key1" UNIQUE ("package_type_id", "country_id_from", "country_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key10" UNIQUE ("package_type_id", "city_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key11" UNIQUE ("package_type_id", "city_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key12" UNIQUE ("package_type_id", "city_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key13" UNIQUE ("package_type_id", "district_id_from", "country_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key14" UNIQUE ("package_type_id", "district_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key15" UNIQUE ("package_type_id", "district_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key16" UNIQUE ("package_type_id", "district_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key17" UNIQUE ("package_type_id", "customer_account_id", "country_id_from", "country_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key18" UNIQUE ("package_type_id", "customer_account_id", "country_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key19" UNIQUE ("package_type_id", "customer_account_id", "country_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key2" UNIQUE ("package_type_id", "country_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key20" UNIQUE ("package_type_id", "customer_account_id", "country_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key21" UNIQUE ("package_type_id", "customer_account_id", "province_id_from", "country_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key22" UNIQUE ("package_type_id", "customer_account_id", "province_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key23" UNIQUE ("package_type_id", "customer_account_id", "province_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key24" UNIQUE ("package_type_id", "customer_account_id", "province_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key25" UNIQUE ("package_type_id", "customer_account_id", "city_id_from", "country_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key26" UNIQUE ("package_type_id", "customer_account_id", "city_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key27" UNIQUE ("package_type_id", "customer_account_id", "city_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key28" UNIQUE ("package_type_id", "customer_account_id", "city_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key29" UNIQUE ("package_type_id", "customer_account_id", "district_id_from", "country_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key3" UNIQUE ("package_type_id", "country_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key30" UNIQUE ("package_type_id", "customer_account_id", "district_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key31" UNIQUE ("package_type_id", "customer_account_id", "district_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key32" UNIQUE ("package_type_id", "customer_account_id", "district_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key4" UNIQUE ("package_type_id", "country_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key5" UNIQUE ("package_type_id", "province_id_from", "country_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key6" UNIQUE ("package_type_id", "province_id_from", "province_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key7" UNIQUE ("package_type_id", "province_id_from", "city_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key8" UNIQUE ("package_type_id", "province_id_from", "district_id_to");
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_unique_key9" UNIQUE ("package_type_id", "city_id_from", "country_id_to");

-- ----------------------------
-- Primary Key structure for table package_price_special
-- ----------------------------
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_pkey" PRIMARY KEY ("package_price_special_id");

-- ----------------------------
-- Primary Key structure for table package_type
-- ----------------------------
ALTER TABLE "public"."package_type" ADD CONSTRAINT "package_type_pkey" PRIMARY KEY ("package_type_id");

-- ----------------------------
-- Indexes structure for table partner
-- ----------------------------
CREATE INDEX "partner_is_deleted_idx" ON "public"."partner" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table partner
-- ----------------------------
ALTER TABLE "public"."partner" ADD CONSTRAINT "partner_pkey" PRIMARY KEY ("partner_id");

-- ----------------------------
-- Primary Key structure for table partner_logistic
-- ----------------------------
ALTER TABLE "public"."partner_logistic" ADD CONSTRAINT "partner_logistic_pkey" PRIMARY KEY ("partner_logistic_id");

-- ----------------------------
-- Primary Key structure for table payment_method
-- ----------------------------
ALTER TABLE "public"."payment_method" ADD CONSTRAINT "payment_method_pkey" PRIMARY KEY ("payment_method_id");

-- ----------------------------
-- Indexes structure for table pickup_request
-- ----------------------------
CREATE INDEX "pickup_request_is_deleted_idx" ON "public"."pickup_request" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "pickup_request_last_request_idx" ON "public"."pickup_request" USING btree (
  "pickup_request_date_time" "pg_catalog"."timestamp_ops" ASC NULLS LAST,
  "pickup_request_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "encrypt_address255" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "partner_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "pickup_request_partner_id" ON "public"."pickup_request" USING btree (
  "partner_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "pickup_request_pickup_request_status_id" ON "public"."pickup_request" USING btree (
  "pickup_request_status_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "pickup_request_pickup_schedule_date_time" ON "public"."pickup_request" USING brin (
  "pickup_schedule_date_time" "pg_catalog"."timestamp_minmax_ops"
);
CREATE INDEX "pickup_request_reference_no_idx" ON "public"."pickup_request" USING btree (
  "reference_no" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table pickup_request
-- ----------------------------
ALTER TABLE "public"."pickup_request" ADD CONSTRAINT "pickup_request_pkey" PRIMARY KEY ("pickup_request_id");

-- ----------------------------
-- Indexes structure for table pickup_request_detail
-- ----------------------------
CREATE INDEX "pickup_request_detail_is_deleted_idx" ON "public"."pickup_request_detail" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "pickup_request_detail_pickup_request_id_idx" ON "public"."pickup_request_detail" USING btree (
  "pickup_request_id" "pg_catalog"."int8_ops" DESC NULLS LAST,
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "pickup_request_detail_ref_awb_number_idx" ON "public"."pickup_request_detail" USING btree (
  "ref_awb_number" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" DESC NULLS LAST
);
CREATE INDEX "pickup_request_detail_shipper_city_idx" ON "public"."pickup_request_detail" USING btree (
  "shipper_city" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" DESC NULLS LAST
);
CREATE INDEX "pickup_request_detail_shipper_district_idx" ON "public"."pickup_request_detail" USING btree (
  "shipper_district" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" DESC NULLS LAST
);
CREATE INDEX "pickup_request_detail_work_order_id_last_idx" ON "public"."pickup_request_detail" USING btree (
  "work_order_id_last" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table pickup_request_detail
-- ----------------------------
ALTER TABLE "public"."pickup_request_detail" ADD CONSTRAINT "pickup_request_detail_pkey" PRIMARY KEY ("pickup_request_detail_id");

-- ----------------------------
-- Indexes structure for table pickup_request_invalid
-- ----------------------------
CREATE INDEX "pickup_request_invalid_created_time" ON "public"."pickup_request_invalid" USING btree (
  "created_time" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "pickup_request_invalid_ref_awb_number" ON "public"."pickup_request_invalid" USING btree (
  "ref_awb_number" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table pickup_request_invalid
-- ----------------------------
ALTER TABLE "public"."pickup_request_invalid" ADD CONSTRAINT "pickup_request_invalid_pkey" PRIMARY KEY ("pickup_request_invalid_id");

-- ----------------------------
-- Primary Key structure for table pickup_request_log
-- ----------------------------
ALTER TABLE "public"."pickup_request_log" ADD CONSTRAINT "pickup_request_log_pkey" PRIMARY KEY ("pickup_request_log_id");

-- ----------------------------
-- Primary Key structure for table pickup_request_status
-- ----------------------------
ALTER TABLE "public"."pickup_request_status" ADD CONSTRAINT "pickup_request_status_pkey" PRIMARY KEY ("pickup_request_status_id");

-- ----------------------------
-- Primary Key structure for table pickup_request_upload
-- ----------------------------
ALTER TABLE "public"."pickup_request_upload" ADD CONSTRAINT "pickup_request_upload_pkey" PRIMARY KEY ("pickup_request_upload_id");

-- ----------------------------
-- Primary Key structure for table pickup_request_upload_detail
-- ----------------------------
ALTER TABLE "public"."pickup_request_upload_detail" ADD CONSTRAINT "pickup_request_upload_detail_pkey" PRIMARY KEY ("pickup_request_upload_detail_id");

-- ----------------------------
-- Primary Key structure for table place
-- ----------------------------
ALTER TABLE "public"."place" ADD CONSTRAINT "place_pkey" PRIMARY KEY ("place_id");

-- ----------------------------
-- Primary Key structure for table place_type
-- ----------------------------
ALTER TABLE "public"."place_type" ADD CONSTRAINT "place_type_pkey" PRIMARY KEY ("place_type_id");

-- ----------------------------
-- Primary Key structure for table pod_scan
-- ----------------------------
ALTER TABLE "public"."pod_scan" ADD CONSTRAINT "pod_scan_pkey" PRIMARY KEY ("pod_scan_id");

-- ----------------------------
-- Primary Key structure for table pod_scan_in
-- ----------------------------
ALTER TABLE "public"."pod_scan_in" ADD CONSTRAINT "pod_scan_in_pkey" PRIMARY KEY ("pod_scan_in_id");

-- ----------------------------
-- Primary Key structure for table province
-- ----------------------------
ALTER TABLE "public"."province" ADD CONSTRAINT "province_pkey" PRIMARY KEY ("province_id");

-- ----------------------------
-- Primary Key structure for table reason
-- ----------------------------
ALTER TABLE "public"."reason" ADD CONSTRAINT "reason_pkey" PRIMARY KEY ("reason_id");

-- ----------------------------
-- Primary Key structure for table received_package
-- ----------------------------
ALTER TABLE "public"."received_package" ADD CONSTRAINT "received_package_pkey" PRIMARY KEY ("received_package_id");

-- ----------------------------
-- Primary Key structure for table received_package_detail
-- ----------------------------
ALTER TABLE "public"."received_package_detail" ADD CONSTRAINT "received_package_detail_pkey" PRIMARY KEY ("received_package_detail_id");

-- ----------------------------
-- Primary Key structure for table representative
-- ----------------------------
ALTER TABLE "public"."representative" ADD CONSTRAINT "representative_pkey" PRIMARY KEY ("representative_id");

-- ----------------------------
-- Primary Key structure for table reseller
-- ----------------------------
ALTER TABLE "public"."reseller" ADD CONSTRAINT "reseller_pkey" PRIMARY KEY ("reseller_id");

-- ----------------------------
-- Primary Key structure for table role
-- ----------------------------
ALTER TABLE "public"."role" ADD CONSTRAINT "role_pkey" PRIMARY KEY ("role_id");

-- ----------------------------
-- Primary Key structure for table role_permission
-- ----------------------------
ALTER TABLE "public"."role_permission" ADD CONSTRAINT "role_permission_pkey1" PRIMARY KEY ("role_permission_id");

-- ----------------------------
-- Primary Key structure for table role_permission_access
-- ----------------------------
ALTER TABLE "public"."role_permission_access" ADD CONSTRAINT "role_permission_access_pkey" PRIMARY KEY ("role_permission_access_id");

-- ----------------------------
-- Primary Key structure for table role_permission_dashboard
-- ----------------------------
ALTER TABLE "public"."role_permission_dashboard" ADD CONSTRAINT "role_permission_dashboard_pkey" PRIMARY KEY ("role_permission_dashboard_id");

-- ----------------------------
-- Primary Key structure for table schema_migrations
-- ----------------------------
ALTER TABLE "public"."schema_migrations" ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");

-- ----------------------------
-- Primary Key structure for table smu
-- ----------------------------
ALTER TABLE "public"."smu" ADD CONSTRAINT "smu_pkey" PRIMARY KEY ("smu_id");

-- ----------------------------
-- Primary Key structure for table smu_item
-- ----------------------------
ALTER TABLE "public"."smu_item" ADD CONSTRAINT "smu_item_pkey" PRIMARY KEY ("smu_item_id");

-- ----------------------------
-- Primary Key structure for table social_media
-- ----------------------------
ALTER TABLE "public"."social_media" ADD CONSTRAINT "social_media_pkey" PRIMARY KEY ("social_media_id");

-- ----------------------------
-- Primary Key structure for table sync_awb
-- ----------------------------
ALTER TABLE "public"."sync_awb" ADD CONSTRAINT "sync_awb_pkey" PRIMARY KEY ("sync_awb_id");

-- ----------------------------
-- Primary Key structure for table sync_awb_file
-- ----------------------------
ALTER TABLE "public"."sync_awb_file" ADD CONSTRAINT "sync_awb_fil_pkey" PRIMARY KEY ("sync_awb_file_id");

-- ----------------------------
-- Primary Key structure for table sync_master
-- ----------------------------
ALTER TABLE "public"."sync_master" ADD CONSTRAINT "sync_master_pkey" PRIMARY KEY ("sync_master_id");

-- ----------------------------
-- Primary Key structure for table sync_master_history
-- ----------------------------
ALTER TABLE "public"."sync_master_history" ADD CONSTRAINT "sync_master_history_pkey" PRIMARY KEY ("sync_master_history_id");

-- ----------------------------
-- Uniques structure for table sys_counter
-- ----------------------------
ALTER TABLE "public"."sys_counter" ADD CONSTRAINT "sys_counter_key_key" UNIQUE ("key");

-- ----------------------------
-- Primary Key structure for table sys_counter
-- ----------------------------
ALTER TABLE "public"."sys_counter" ADD CONSTRAINT "sys_counter_pkey" PRIMARY KEY ("sys_counter_id");

-- ----------------------------
-- Primary Key structure for table todos
-- ----------------------------
ALTER TABLE "public"."todos" ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table user_api
-- ----------------------------
ALTER TABLE "public"."user_api" ADD CONSTRAINT "user_api_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table user_notification_msg
-- ----------------------------
ALTER TABLE "public"."user_notification_msg" ADD CONSTRAINT "user_notification_msg_pkey" PRIMARY KEY ("user_notification_msg_id");

-- ----------------------------
-- Primary Key structure for table user_role
-- ----------------------------
ALTER TABLE "public"."user_role" ADD CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_role_id");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("user_id");

-- ----------------------------
-- Indexes structure for table work_order
-- ----------------------------
CREATE INDEX "work_order_branch_id_assigned_idx" ON "public"."work_order" USING btree (
  "branch_id_assigned" "pg_catalog"."int8_ops" DESC NULLS LAST
);
CREATE INDEX "work_order_customer_account_id_idx" ON "public"."work_order" USING btree (
  "customer_account_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "work_order_is_deleted_idx" ON "public"."work_order" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table work_order
-- ----------------------------
ALTER TABLE "public"."work_order" ADD CONSTRAINT "work_order_pkey" PRIMARY KEY ("work_order_id");

-- ----------------------------
-- Indexes structure for table work_order_detail
-- ----------------------------
CREATE INDEX "work_order_detail_is_deleted_idx" ON "public"."work_order_detail" USING btree (
  "is_deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "work_order_detail_ref_awb_number_idx" ON "public"."work_order_detail" USING btree (
  "ref_awb_number" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" DESC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table work_order_detail
-- ----------------------------
ALTER TABLE "public"."work_order_detail" ADD CONSTRAINT "work_order_detail_pkey" PRIMARY KEY ("work_order_detail_id");

-- ----------------------------
-- Primary Key structure for table work_order_history
-- ----------------------------
ALTER TABLE "public"."work_order_history" ADD CONSTRAINT "work_order_history_pkey" PRIMARY KEY ("work_order_history_id");

-- ----------------------------
-- Primary Key structure for table work_order_schedule
-- ----------------------------
ALTER TABLE "public"."work_order_schedule" ADD CONSTRAINT "work_order_schedule_pkey" PRIMARY KEY ("work_order_schedule_id");

-- ----------------------------
-- Primary Key structure for table work_order_status
-- ----------------------------
ALTER TABLE "public"."work_order_status" ADD CONSTRAINT "work_order_status_pkey" PRIMARY KEY ("work_order_status_id");

-- ----------------------------
-- Primary Key structure for table zone
-- ----------------------------
ALTER TABLE "public"."zone" ADD CONSTRAINT "zone_pkey" PRIMARY KEY ("zone_id");

-- ----------------------------
-- Foreign Keys structure for table items
-- ----------------------------
ALTER TABLE "public"."items" ADD CONSTRAINT "fk_rails_c01e6b449d" FOREIGN KEY ("todo_id") REFERENCES "public"."todos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table package_price
-- ----------------------------
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_city_id_from_fkey" FOREIGN KEY ("city_id_from") REFERENCES "public"."city" ("city_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_city_id_to_fkey" FOREIGN KEY ("city_id_to") REFERENCES "public"."city" ("city_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_country_id_from_fkey" FOREIGN KEY ("country_id_from") REFERENCES "public"."country" ("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_country_id_to_fkey" FOREIGN KEY ("country_id_to") REFERENCES "public"."country" ("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_district_id_from_fkey" FOREIGN KEY ("district_id_from") REFERENCES "public"."district" ("district_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_district_id_to_fkey" FOREIGN KEY ("district_id_to") REFERENCES "public"."district" ("district_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_package_type_id_fkey" FOREIGN KEY ("package_type_id") REFERENCES "public"."package_type" ("package_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_province_id_from_fkey" FOREIGN KEY ("province_id_from") REFERENCES "public"."province" ("province_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price" ADD CONSTRAINT "package_price_province_id_to_fkey" FOREIGN KEY ("province_id_to") REFERENCES "public"."province" ("province_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table package_price_special
-- ----------------------------
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_city_id_from_fkey" FOREIGN KEY ("city_id_from") REFERENCES "public"."city" ("city_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_city_id_to_fkey" FOREIGN KEY ("city_id_to") REFERENCES "public"."city" ("city_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_country_id_from_fkey" FOREIGN KEY ("country_id_from") REFERENCES "public"."country" ("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_country_id_to_fkey" FOREIGN KEY ("country_id_to") REFERENCES "public"."country" ("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_customer_account_id_fkey" FOREIGN KEY ("customer_account_id") REFERENCES "public"."customer_account" ("customer_account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_district_id_from_fkey" FOREIGN KEY ("district_id_from") REFERENCES "public"."district" ("district_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_district_id_to_fkey" FOREIGN KEY ("district_id_to") REFERENCES "public"."district" ("district_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_package_type_id_fkey" FOREIGN KEY ("package_type_id") REFERENCES "public"."package_type" ("package_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_province_id_from_fkey" FOREIGN KEY ("province_id_from") REFERENCES "public"."province" ("province_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."package_price_special" ADD CONSTRAINT "package_price_special_province_id_to_fkey" FOREIGN KEY ("province_id_to") REFERENCES "public"."province" ("province_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table place
-- ----------------------------
ALTER TABLE "public"."place" ADD CONSTRAINT "place_district_fk" FOREIGN KEY ("district_id") REFERENCES "public"."district" ("district_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."place" ADD CONSTRAINT "place_place_type_fk" FOREIGN KEY ("place_type_id") REFERENCES "public"."place_type" ("place_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
