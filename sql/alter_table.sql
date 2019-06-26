-- ALTER table : awb 24/05/2019

ALTER TABLE awb
ADD COLUMN awb_trouble_id bigint;


-- ALTER table : do_pod_detail 24/05/2019

ALTER TABLE do_pod_detail
ADD COLUMN employee_journey_id_in bigint,ADD COLUMN employee_journey_id_out bigint;


-- ALTER table : do_pod 24/05/2019

ALTER TABLE do_pod
ADD COLUMN partner_logistic_id bigint;

-- ALTER table : do_pod 21/06/2019

ALTER TABLE do_pod
ADD COLUMN do_pod_method int;

ALTER TABLE do_pod
ADD COLUMN vehicle_number varchar (100);

ALTER TABLE do_pod
ADD COLUMN description text;


-- ALTER table : do_pod 28/05/2019

ALTER TABLE pod_scan
ADD COLUMN bag_id bigint;
ADD COLUMN bag_item_id bigint;