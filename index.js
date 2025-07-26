const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const customCors = require("./middleware/customCors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.use("/api/tempMail", customCors, require("./routes/tempMail"));
app.use("/api/message", customCors, require("./routes/message"));
app.use("/api", customCors, require("./routes/webhook"));

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});