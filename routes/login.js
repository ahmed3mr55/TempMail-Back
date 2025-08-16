const express = require("express");
const router = express.Router();
const { TempMail } = require("../models/TempMail");
const Joi = require("joi");

router.post("/", async (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error } = schema.validate({ email, password });
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const temp = await TempMail.findOne({ email });
    if (!temp || temp.password !== password)
      return res.status(401).json({ error: "Invalid local email or password" });
    res
      .status(200)
      .cookie("Email", email, {
        maxAge: temp.expiresAt.getTime() - Date.now(),
        httpOnly: false,
        sameSite: "none",
        secure: true,
        path: "/",
      })
      .json({
        email,
        expiresAt: temp.expiresAt,
      });
  } catch (error) {
    console.error("Error checking temporary email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
