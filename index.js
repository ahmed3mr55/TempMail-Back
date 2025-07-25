const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://www.misho.cfd",
  "https://misho.cfd",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.use("/api/tempMail", require("./routes/tempMail"));
app.use("/api/message", require("./routes/message"));
// Webhook route
app.use("/api", require("./routes/webhook"));

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
