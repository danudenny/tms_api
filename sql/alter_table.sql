-- ALTER table : awb 24/05/2019

ALTER TABLE awb
ADD COLUMN awb_trouble_id bigint;


-- ALTER table : do_pod_detail 24/05/2019

ALTER TABLE do_pod_detail
ADD COLUMN employee_journey_id_in bigint,ADD COLUMN employee_journey_id_out bigint;


-- ALTER table : do_pod 24/05/2019

ALTER TABLE do_pod
ADD COLUMN partner_logistic_id bigint;
