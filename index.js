const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const customCors = require("./middleware/customCors");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;


// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  max: 1500,
  message: {
    success: false,
    error: "Too many requests from your IP, please try again later.",
  },
});

const corsOptions = {
  origin: ["https://misho.cfd", "https://www.misho.cfd", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 3600, // 1 hour
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

connectDB();

// Routes
app.use("/api/tempMail", cors(corsOptions), require("./routes/tempMail"));
app.use("/api/login", cors(corsOptions), require("./routes/login"));
app.use("/api/message", cors(corsOptions), require("./routes/message"));
app.use("/api", require("./routes/webhook"));

app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});