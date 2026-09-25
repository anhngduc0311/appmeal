const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes/api");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api", apiRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Node API is running",
  });
});

app.use(errorMiddleware);

module.exports = app;
