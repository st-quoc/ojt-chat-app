const SessionModel = require("../models/Session");

exports.getById = async ({ id }) => {
const session = await SessionModel.findById({_id : id});
if(!session){
    throw new Error("Invalid id ");
}
  return { session: session, message: "User registered successfully" };
};