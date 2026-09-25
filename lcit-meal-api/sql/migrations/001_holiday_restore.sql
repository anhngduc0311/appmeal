-- Keep the original state only for rows actually cancelled by a holiday.
CREATE TABLE IF NOT EXISTS holiday_event_meal (
  event_id INT UNSIGNED NOT NULL,
  meal_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (event_id, meal_id),
  FOREIGN KEY (event_id) REFERENCES holiday_event(id) ON DELETE CASCADE,
  FOREIGN KEY (meal_id) REFERENCES meal(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS holiday_event_registration (
  event_id INT UNSIGNED NOT NULL,
  registration_id INT UNSIGNED NOT NULL,
  previous_status VARCHAR(20) NOT NULL,
  PRIMARY KEY (event_id, registration_id),
  FOREIGN KEY (event_id) REFERENCES holiday_event(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_id) REFERENCES meal_registration(id) ON DELETE CASCADE
) ENGINE=InnoDB;
