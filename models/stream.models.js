const uuid = require("uuid");
const mongoose = require("mongoose");
const { Mixed } = mongoose.Schema.Types;

exports.StreamModel = mongoose.model(
  "streams",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      name: { type: String, require: true },
      domain: { type: Array, default: [], require: true},
      enable: { type: Boolean, default: true },
      used: { type: Mixed, default: 0 },
    },
    {
      timestamps: true,
    }
  )
);
