const { FileModel } = require("../models/file.models");

exports.getEmbed = async (req, res) => {
  try {
    const { slug } = req.params;

    let data = {
      title: `Player`,
      base_color: `#ff0000`,
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
        pipIcon: "true",
        horizontalVolumeSlider: true,
      },
    };
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

    data.title = file.title;
    data.slug = slug;
    data.jwplayer.sources = file.sources;
    data.jwplayer.image = `//${file.domain}/thumb/${slug}-5.jpg`;

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
