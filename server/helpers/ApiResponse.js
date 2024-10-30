class ApiResponse {
  static success(res, data, message = "Success") {
    res.status(200).json({ message, data });
  }

  static error(res, message = "Error", statusCode = 500) {
    res.status(statusCode).json({ message });
  }
}

module.exports = ApiResponse;
