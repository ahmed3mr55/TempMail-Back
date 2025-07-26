const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const customCors = require("./middleware/customCors");
const cors = require("cors");
const { allow } = require("joi");

const app = express();
const PORT = process.env.PORT || 5000;



const corsOptions = {
  origin: "https://www.misho.cfd",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600, // 1 hour
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.use("/api/tempMail", require("./routes/tempMail"));
app.use("/api/message", require("./routes/message"));
app.use("/api", require("./routes/webhook"));

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});