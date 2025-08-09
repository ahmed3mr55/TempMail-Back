const Joi = require("joi");
const mongoose = require("mongoose");

const tempMailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
tempMailSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const TempMail = mongoose.model("TempMail", tempMailSchema);

module.exports = { TempMail };
