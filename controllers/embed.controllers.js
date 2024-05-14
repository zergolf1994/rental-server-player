const { FileModel } = require("../models/file.models");
const { PlayerModel } = require("../models/player.models");
const { SettingModel, getSettingbyName } = require("../models/setting.models");
const { UserModel } = require("../models/user.models");
const { remaining } = require("../utils/date");
const { get_ua } = require("../utils/user-agent.utils");

exports.getEmbed = async (req, res) => {
  try {
    const host =
      req.get("host") == "localhost" ? "online.playhls.xyz" : req.get("host");

    const { slug } = req.params;
    const { poster } = req.query;
    // get player data
    const player = await PlayerModel.findOne({ domain: host });

    if (!player) {
      const error = new Error("ไม่พบโดเมนนี้.");
      error.code = 404;
      throw error;
    }
    if (!player.isConnect) {
      const error = new Error("โดเมนนี้ยังไม่ได้เชื่อมต่อ.");
      error.code = 403;
      throw error;
    }
    if (!player.enable) {
      const error = new Error("โดเมนนี้ยังไม่ได้เปิดใช้งาน.");
      error.code = 403;
      throw error;
    }
    const player_main = await SettingModel.findOne({ name: "player_main" });

    if (!player_main.value) {
      const error = new Error("ระบบยังไม่เปิดใช้งาน.");
      error.code = 500;
      throw error;
    }
    const file = await FileModel.findOne({ slug }).select("title");
    if (!file) {
      const error = new Error("ไม่พบไฟล์.");
      error.code = 404;
      throw error;
    }

    let data = {
      title: file.title,
      host,
      lang: "th",
      pd: req.get("host") == "localhost" ? "localhost" : player_main.value,
      code: {
        dId: player?._id,
      },
      allow: player?.whitelists || [],
    };
    if (poster) data.code.poster = poster;

    data.iframe_url = `//${data.pd}/v/${slug}?${new URLSearchParams(
      data.code
    ).toString()}`;
    console.log(data.allow);
    return res.render("embed", data);
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

exports.getVembed = async (req, res) => {
  try {
    const { slug } = req.params;
    const { dId, poster } = req.query;
    const ua = get_ua(req?.headers["user-agent"]);
    /*const domain =
      req.get("host") == "localhost" ? "online.playhls.xyz" : req.get("host");
    */
    let data = {
      title: `Player`,
      base_color: `#ff0000`,
      base_color2: `#ff00`,
      host: req.get("host"),
      lang: "th",
      jwplayer: {
        key:
          "ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc=" ||
          "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99",
        width: "100%",
        height: "100%",
        preload: "metadata",
        primary: "html5",
        hlshtml: "true",
        controls: "true",
        horizontalVolumeSlider: true,
        //androidhls: true,
        //cast: { appid: "00000000" },
        pipIcon: "disabled",
      },
      options: {
        p2p_enable: true,
      },
    };
    // get player data
    let player_where = {};
    if (dId) {
      player_where._id = dId;
    } else {
      const player_main = await getSettingbyName("player_main");

      if (!player_main.value) {
        const error = new Error("ระบบยังไม่เปิดใช้งาน.");
        error.code = 500;
        throw error;
      }
      player_where.domain = player_main?.value;
    }

    const player = await PlayerModel.findOne(player_where);
    if (!player) {
      const error = new Error("ไม่พบโดเมนนี้.");
      error.code = 404;
      throw error;
    }

    // get user data
    const user = await UserModel.findOne({ _id: player.userId });
    /*if (!user) {
      const error = new Error("This user doesn't exist.");
      error.code = 404;
      throw error;
    }*/

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
    } else if (!user) {
      user_ad = true;
    }

    data.title = file.title;
    data.slug = slug;

    data.jwplayer.sources = file.sources;
    data.jwplayer.image = poster || `//${file.domain}/thumb/${slug}-5.jpg`;

    if (player?.player_options?.video_title) data.jwplayer.title = file.title;
    if (player?.player_options?.video_mute) data.jwplayer.mute = true;

    if (player?.player_options?.video_continue)
      data.options.video_continue = true;

    if (ua?.browser?.name == "Safari" && ua?.device?.vendor == "Apple") {
      data.options.p2p_enable = false;
    }

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
    return res.render("p2p_v1", data);
    //return res.render("embed_p2p", data);
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
