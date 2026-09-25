const ApiResponse = require("../ultis/ApiResponse");

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  return ApiResponse.error(res, err.message, err.statusCode || 500, null);
};

module.exports = errorMiddleware;
