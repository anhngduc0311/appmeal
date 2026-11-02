const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes/api");
const errorMiddleware = require("./middlewares/errorMiddleware");
const env = require("./config/env");

const app = express();

app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api", apiRoutes);
app.get('/healthz', async (req, res) => {
  try {
    await require('./config/database').query('SELECT 1 AS healthy');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});
app.get("/", (req, res) => {
  res.json({
    message: "Node API is running",
  });
});

app.use(errorMiddleware);

module.exports = app;
