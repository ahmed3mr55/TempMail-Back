const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// 1) middleware لقراءة JSON body
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
// 2) middleware لقراءة URL‑encoded body (form-data)
app.use(express.urlencoded({ extended: true }));

connectDB();

// ربط الراوتات
app.use("/api/tempMail", require("./routes/tempMail"));
app.use("/api/message", require("./routes/message"));
// Webhook route
app.use("/api", require("./routes/webhook"));

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
