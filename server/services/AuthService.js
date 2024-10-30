const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

exports.register = async ({ username, password, email }) => {
  const user = new UserModel({ username, password, email });
  await user.save();
  return { userId: user._id, message: "User registered successfully" };
};

exports.login = async (email, password) => {
  const user = await UserModel.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid email or password");
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return { token, message: "Login Successfully!" };
};
