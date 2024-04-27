const uuid = require("uuid");
const mongoose = require("mongoose");

exports.PlayerModel = mongoose.model(
  "players",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      domain: { type: String, require: true, unique: true },
      isConnect: { type: Boolean, default: false },
      enable: { type: Boolean, default: false },
      enable_advert: { type: Boolean, default: false },
      slug: { type: String, require: true, unique: true },
      userId: { type: String },
      whitelists: { type: Array },
      adverts: { type: Array },
      player_options: {
        type: Object,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  )
);
