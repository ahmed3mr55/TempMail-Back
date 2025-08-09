const express = require("express");
const crypto = require("crypto");
const { TempMail } = require("../models/TempMail");
const { Message } = require("../models/Message");
const router = express.Router();
const Joi = require("joi");

function generateRandomString(length = 8) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

function generatePassword(length = 8) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

function parseTTL(ttl) {
  if (typeof ttl !== "string") return null;
  const m = ttl.match(/^(\d+)([hd])$/i);
  if (!m) return null;
  let [, num, unit] = m;
  num = parseInt(num, 10);
  let ms;
  if (unit.toLowerCase() === "h") {
    ms = num * 60 * 60 * 1000;
  } else if (unit.toLowerCase() === "d") {
    ms = num * 24 * 60 * 60 * 1000;
  }
  // Limit to 24 hours max
  return Math.min(ms, 24 * 60 * 60 * 1000 * 30); // 30 days
}

router.post("/generate", async (req, res) => {
  try {
    // Generate a random email address
    const localPart = generateRandomString(10);
    const domainPart = "@in.misho.cfd";
    let email = `${localPart}${domainPart}`;
    const { ttl } = req.body;
    const ms = parseTTL(ttl) ?? 30 * 60 * 1000;
    if (ms <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid ttl format. Use e.g. '1h', '12h', '1d'." });
    }

    // Check if the email already exists in the database
    const existingEmail = await TempMail.findOne({ email });
    if (existingEmail) {
      while (existingEmail) {
        const localPart = generateRandomString(10);
        const email = `${localPart}${domainPart}`;
        existingEmail = await TempMail.findOne({ email });
      }
    }

    const temp = new TempMail({
      email,
      password: generatePassword(),
      expiresAt: new Date(Date.now() + ms),
    });
    await temp.save();
    res
      .status(201)
      .cookie("Email", email, {
        maxAge: ms,
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
    console.error("Error generating temporary email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Generate temporary email with subdomain
router.post("/generate/:subdomain", async (req, res) => {
  try {
    const { subdomain } = req.params;
    const schema = Joi.object({
      subdomain: Joi.string().alphanum().min(4).max(20).required(),
    });
    const { error } = schema.validate({ subdomain });
    if (error) return res.status(400).json({ error: error.details[0].message });
    const email = `${subdomain}@in.misho.cfd`;
    const { ttl } = req.body;
    const ms = parseTTL(ttl) ?? 30 * 60 * 1000;
    if (ms <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid ttl format. Use e.g. '1h', '12h', '1d'." });
    }
    const findTemp = await TempMail.findOne({ email });
    if (findTemp) {
      return res
        .status(400)
        .json({ error: "Temporary email with this subdomain already exists" });
    }
    const temp = new TempMail({
      email,
      password: generatePassword(),
      expiresAt: new Date(Date.now() + ms),
    });
    await temp.save();
    res
      .status(201)
      .cookie("Email", email, {
        maxAge: ms,
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
    console.error("Error generating temporary email with subdomain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/check-email", async (req, res) => {
  try {
    const email = req.cookies.Email;
    const temp = await TempMail.findOne({ email });
    if (!temp) {
      return res
        .status(404)
        .clearCookie("Email")
        .json({ error: "Temporary email not found" });
    }
    return res.status(200).json({
      email,
      expiresAt: temp.expiresAt,
      createdAt: temp.createdAt,
    });
  } catch (error) {
    console.error("Error checking temporary email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/delete/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await Message.deleteMany({ to: email });
    const result = await TempMail.deleteOne({ email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Temporary email not found" });
    }
    return res
      .clearCookie("Email", {
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting temporary email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
