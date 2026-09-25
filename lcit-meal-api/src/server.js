const app = require("./app");
const env = require("./config/env");
const autoScheduleJob = require("./jobs/autoScheduleJob");
const paymentReminderJob = require("./jobs/paymentReminderJob");
const mealCompletionJob = require("./jobs/mealCompletionJob");

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  autoScheduleJob.start();
  paymentReminderJob.start();
  mealCompletionJob.start();
});
