const express = require("express");
const multer = require("multer");
const { simpleParser } = require("mailparser");
const { TempMail } = require("../models/TempMail");
const { Message } = require("../models/Message");

const router = express.Router();
const upload = multer();

router.post("/incoming", upload.none(), async (req, res) => {
  console.log("Content‑Type:", req.headers["content-type"]);
  console.log("Body keys:", Object.keys(req.body));

  try {
    // 1) استخرج العنوان الفعلي
    let actualTo;
    if (req.body.envelope) {
      const env = JSON.parse(req.body.envelope);
      actualTo = env.to && env.to[0];
    }
    if (!actualTo && req.body.to) {
      const m = req.body.to.match(/<(.+)>/);
      actualTo = m ? m[1] : req.body.to;
    }
    if (!actualTo) return res.status(400).send("Cannot parse recipient address");

    // 2) تأكد أن TempMail موجود
    const temp = await TempMail.findOne({ email: actualTo.trim() });
    if (!temp) return res.status(404).send("Temp email not found");

    // 3) فكّ الرسالة كاملة من req.body.email
    const rawEmail = req.body.email;          // هنا كامل الـ MIME
    const parsed = await simpleParser(rawEmail);
    const textBody = parsed.text || "";
    const htmlBody = parsed.html || "";

    // 4) خزّن الرسالة مع النص والـ HTML
    await Message.create({
      mail: temp._id,
      from: parsed.from.text,               // يضمن الشكل الصحيح
      to: actualTo.trim(),
      subject: parsed.subject || req.body.subject,
      body: textBody,
      html: htmlBody,
      raw: rawEmail,
      expiresAt: temp.expiresAt,
    });

    return res.status(200).send("Stored");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
