-- Apply before deploying the facility-aware UserRepository on MySQL/MariaDB.
ALTER TABLE user ADD COLUMN facility_id SMALLINT NULL;
ALTER TABLE user ADD CONSTRAINT chk_user_facility CHECK (facility_id IN (1,2));
