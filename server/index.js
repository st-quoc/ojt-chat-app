const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { mongoConnect } = require("./config/db");
const errorHandler = require("./middlewares/ErrorMiddleware");
const UserRoutes = require("./routes/UserRoutes");
const apiRoutes = require("./routes/api");
const SessionRoutes = require("./routes/SessionRoutes");
const path = require("path"); // Import path module

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory if needed
app.use(express.static(path.join(__dirname, 'public')));

// Serve chat.html from the 'pages' directory
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'chat.html'));
});

// Error handling middleware
app.use(errorHandler);

// User routes
app.use('/api/users', UserRoutes);
app.use('/api', apiRoutes);



// Connect to MongoDB
mongoConnect();

const PORT = process.env.PORT || 8000;
app.listen(PORT, function (error) {
  if (error) {
    console.log('Something went wrong');
  }
  console.log('Server is running on port: ' + PORT);
});
