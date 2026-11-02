const env = require("./env");

const pool = env.databaseUrl
  ? require('./postgres').createPool(env.databaseUrl, env.databaseSchema)
  : require('mysql2/promise').createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    // Business DATE values must not become UTC timestamps during JSON serialization.
    dateStrings: ['DATE'],
    waitForConnections: true,
    connectionLimit: 10,
})

module.exports = pool;
