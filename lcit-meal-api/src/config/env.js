require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  corsOrigins: (process.env.CORS_ORIGINS ||
    'http://localhost:5173,http://localhost:8081,http://127.0.0.1:5173,http://127.0.0.1:8081')
    .split(',').map(origin => origin.trim()).filter(Boolean),

  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
  },
};
