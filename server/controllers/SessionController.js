const SessionServices = require("../services/SessionService");
const ApiResponse = require("../helpers/ApiResponse");

exports.getSessionById = async (req, res) => {
  const id = req.params.id;
  console.log(id)
  try {
    const result = await SessionServices.getById(id);
    ApiResponse.success(res, result);
  } catch (error) {
    ApiResponse.error(res, error.message, 401);
  }
};
