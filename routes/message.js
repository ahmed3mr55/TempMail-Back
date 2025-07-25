const express = require("express");
const { TempMail } = require("../models/TempMail");
const { Message } = require("../models/Message");
const router = express.Router();

router.get("/inbox/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const temp = await TempMail.findOne({ email });
    if (!temp)
      return res.status(404).json({ error: "Temporary email not found" });
    const messages = await Message.find({ mail: temp._id }).select("from subject").sort("-createdAt");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching inbox messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/inbox/:email/check-messages", async (req, res) => {
  const { email } = req.params;
  try {
    const temp = await TempMail.findOne({ email });
    if (!temp) return res.status(404).json({ error: "Temporary email not found" });
    const messages = await Message.find({ mail: temp._id }).sort("-createdAt").select("from subject");
    if (!messages || messages.length === 0) {
      return res.status(404).json({ error: "No messages found for this email" });
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error checking messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

// GET single message by ID
router.get("/inbox/message/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const message = await Message.findById(id).populate("mail", "email");
    message.read = true; // Mark as read
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

// create a new message testing the temporary email
router.post("/inbox/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { subject, body, row, from } = req.body;
    const temp = await TempMail.findOne({ email });
    if (!temp)
      return res.status(404).json({ error: "Temporary email not found" });
    const message = new Message({
      mail: temp._id,
      from,
      to: email,
      row,
      subject,
      body,
      expiresAt: temp.expiresAt,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
