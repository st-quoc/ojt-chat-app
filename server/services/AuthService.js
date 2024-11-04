const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

exports.register = async ({ username, password, email }) => {
  const user = new UserModel({ username, password, email });
  await user.save();
  return { userId: user._id, message: 'User registered successfully' };
};

exports.login = async (email, password) => {
  const user = await UserModel.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  userId = user._id;
  return { userId, message: 'Login Successfully!' };
};

exports.sendResetPasswordEmail = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dat.dev.gw@gmail.com',
      pass: 'zqjj txcn pqph zdfm',
    },
  });

  const mailOptions = {
    from: 'dat.dev.gw@gmail.com',
    to: email,
    subject: '[S-Tier] - Password Reset',
    text:
      `Hey there,\n\n` +
      `We noticed you might have misplaced your password—perhaps it ran off to join the circus or fell in love with a cat? 😸 No worries!\n\n` +
      `Just click the magical link below to reset your password and bring it back home:\n\n` +
      `👉 https://ojt-chat-app.vercel.app/pages/redirect-reset.html?token=${resetToken} 👈\n\n` +
      `Remember, this link will expire in 1 hour—just like that sandwich you forgot in the fridge! 🥪\n\n` +
      `Happy password hunting! 🕵️‍♂️\n\n` +
      `Cheers,\n` +
      `[I think you forgot where you saved your password because you missed your lover so much. So this function was created for you. - @datkingvn]`,
  };

  await transporter.sendMail(mailOptions);
  return { message: 'Password Reset Email Sent' };
};

exports.resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await UserModel.findById({
    _id: decoded.userId,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error('Password reset token is invalid or has expired');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { message: 'Password has been reset successfully!' };
};
