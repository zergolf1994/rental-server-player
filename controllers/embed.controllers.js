const { FileModel } = require("../models/file.models");
const { PlayerModel } = require("../models/player.models");
const { UserModel } = require("../models/user.models");
const { remaining } = require("../utils/date");

exports.getEmbed = async (req, res) => {
  try {
    const { slug } = req.params;
    const domain =
      req.get("host") == "localhost" ? "online.playhls.xyz" : req.get("host");
    let data = {
      title: `Player`,
      base_color: `#ff0000`,
      base_color2: `#ff00`,
      host: req.get("host"),
      lang: "th",
      jwplayer: {
        key: "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99",
        width: "100%",
        height: "100%",
        preload: "metadata",
        primary: "html5",
        hlshtml: "true",
        controls: "true",
        horizontalVolumeSlider: true,
      },
      options: {},
    };
    // get player data
    const player = await PlayerModel.findOne({ domain });
    if (!player) {
      const error = new Error("This domain doesn't exist.");
      error.code = 404;
      throw error;
    }

    // get user data
    const user = await UserModel.findOne({ _id: player.userId });
    if (!user) {
      const error = new Error("This user doesn't exist.");
      error.code = 404;
      throw error;
    }

    const files = await FileModel.aggregate([
      { $match: { slug } },
      { $limit: 1 },
      //media
      {
        $lookup: {
          from: "medias",
          localField: "_id",
          foreignField: "fileId",
          as: "medias",
          pipeline: [
            { $match: { quality: { $ne: "original" } } },
            {
              $project: {
                quality: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          total_media: { $size: "$medias" },
        },
      },
      //encode
      {
        $lookup: {
          from: "encodes",
          localField: "_id",
          foreignField: "fileId",
          as: "encodes",
          pipeline: [
            { $match: { type: "video" } },
            {
              $project: {
                quality: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          total_encode: { $size: "$encodes" },
        },
      },
      //server
      {
        $lookup: {
          from: "servers",
          as: "servers",
          pipeline: [
            {
              $match: {
                type: "general",
                "options.public_url": { $ne: undefined },
              },
            },
            {
              $project: {
                options: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          server: { $arrayElemAt: ["$servers", 0] },
        },
      },
      {
        $set: {
          ready: {
            $cond: {
              if: {
                $gt: ["$total_media", 0],
              },
              then: true,
              else: false,
            },
          },
          encoding: {
            $cond: {
              if: {
                $gt: ["$total_encode", 0],
              },
              then: true,
              else: false,
            },
          },
          domain: "$server.options.public_url",
        },
      },
      {
        $set: {
          sources: {
            $cond: {
              if: { $gte: ["$ready", 1] },
              then: [
                {
                  file: {
                    $concat: [
                      "//",
                      "$server.options.public_url",
                      "/master/",
                      "$$ROOT.slug",
                    ],
                  },
                  type: "application/vnd.apple.mpegurl",
                },
              ],
              else: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          ready: 1,
          encoding: 1,
          sources: 1,
          domain: 1,
          categoryId: 1,
        },
      },
    ]);

    if (!files?.length) {
      const error = new Error("This video doesn't exist.");
      error.code = 404;
      throw error;
    }
    const file = files[0];

    if (!file.ready && !file.encoding) throw new Error("Formatting video");
    if (!file.ready && file.encoding)
      throw new Error("We're processing this video. Check back later.");

    let user_ad = false;
    if (user?.categorys.includes(file.categoryId)) {
      //user advert
      const remain = remaining(user?.exp_date);
      if (remain > 0) user_ad = true;
    }

    data.title = file.title;
    data.slug = slug;

    data.jwplayer.sources = file.sources;
    data.jwplayer.image = `//${file.domain}/thumb/${slug}-5.jpg`;

    if (player?.player_options?.video_title) data.jwplayer.title = file.title;
    if (player?.player_options?.video_mute) data.jwplayer.mute = true;

    if (player?.player_options?.video_continue)
      data.options.video_continue = true;

    data.jwplayer.skin = {
      controlbar: {
        iconsActive: data?.base_color,
      },
      timeslider: {
        progress: data?.base_color,
      },
      menus: {
        background: "#121212",
        textActive: data?.base_color,
      },
    };

    if (user_ad === true) {
      //user
      /*data.jwplayer.advertising = {
        client: "vast",
        schedule: [
          {
            offset: "pre",
            tag: `//${data.host}/assets/advertising.xml`,
          },
        ],
      };*/
    } else {
      //website
      data.jwplayer.advertising = {
        client: "vast",
        schedule: [
          {
            offset: "pre",
            tag: `//${data.host}/assets/advertising.xml`,
          },
        ],
      };
    }

    return res.render("embed_p2p", data);
  } catch (err) {
    let data = {
      title: `Player`,
      host: req.get("host"),
      lang: "th",
    };
    data.title = err?.message;
    data.msg = err?.message;
    return res.status(err?.code || 500).render("error", data);
  }
};
