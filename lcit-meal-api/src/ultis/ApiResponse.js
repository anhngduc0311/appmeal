class ApiResponse {
  static success(res, payload = null, code = 200) {
    return res.status(code).json({
      success: true,
      payload,
      error: null,
    });
  }

  static error(
    res,
    message = "An error occurred!",
    code = 500,
    payload = null,
  ) {
    return res.status(code).json({
      success: false,
      payload,
      error: {
        code,
        message,
      },
    });
  }
}

module.exports = ApiResponse;
