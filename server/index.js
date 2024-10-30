const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { mongoConnect } = require("./config/db");
const errorHandler = require("./middlewares/ErrorMiddleware");
const UserRoutes = require("./routes/UserRoutes");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(errorHandler);

app.use("/api/users", UserRoutes);

mongoConnect();

const PORT = process.env.PORT || 8000;
app.listen(PORT, function (error) {
  if (error) {
    console.log("Something went wrong");
  }
  console.log("server is running port:  " + PORT);
});
