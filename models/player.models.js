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
        default: {
          block_direct: { type: Boolean, default: false },
          block_devtools: { type: Boolean, default: false },
          video_title: { type: Boolean, default: false },
          video_mute: { type: Boolean, default: false },
          video_repeat: { type: Boolean, default: false },
          video_autoplay: { type: Boolean, default: false },
          video_continue: { type: Boolean, default: false },
          video_button_chromecast: { type: Boolean, default: false },
          video_button_download: { type: Boolean, default: false },
          video_button_pip: { type: Boolean, default: false },
        },
      },
    },
    {
      timestamps: true,
    }
  )
);
