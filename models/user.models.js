const uuid = require("uuid");
const mongoose = require("mongoose");

exports.UserModel = mongoose.model(
  "users",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      enable: { type: Boolean, default: true },
      verified: { type: Boolean, default: false },
      name: { type: String },
      image: { type: String },
      email: { type: String, require: true, unique: true },
      password: { type: String },
      accessed: { type: Array, default: ["client"] },
      categorys: { type: Array, default: [] },
      players: { type: Number, default: 1 },
      exp_date: { type: Date },
    },
    {
      timestamps: true,
    }
  )
);
