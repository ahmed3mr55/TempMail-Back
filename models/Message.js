const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  mail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TempMail",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    default: "(No Subject)",
  },
  body: {
    type: String,
    default: "",
  },
  row: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  html: {
    type: String,
    default: "",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };
