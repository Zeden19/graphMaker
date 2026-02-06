class AppError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

const errorStatus = {
  missing_fields: 400,
  invalid_json: 400,
  invalid_graph: 400,
  invalid_token: 401,
  invalid_credentials: 401,
  unauthorized: 401,
  not_found: 404,
  email_taken: 409,
  db_error: 500,
  email_failed: 500
};

module.exports = {
  AppError,
  errorStatus
};
