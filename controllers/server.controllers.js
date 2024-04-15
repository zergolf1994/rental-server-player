const { ServerModel } = require("../models/server.models");
const fs = require("fs-extra");
const { get_os, get_disk } = require("../utils/os");
const { getLocalServer } = require("../utils/server.utils");

exports.serverDetail = async (req, res) => {
  try {
    let { ip_v4, hostname } = get_os();
    const disk = await get_disk();
    return res.json({ ip_v4, hostname, ...disk });
  } catch (err) {
    return res.json({ error: true });
  }
};

exports.serverCreate = async (req, res) => {
  try {
    let { ip_v4, hostname, platform } = get_os();

    const count = await ServerModel.countDocuments({
      sv_ip: ip_v4,
      type: global.sv_type,
    });

    if (count) throw new Error("exists");

    const disk = await get_disk();
    const saveDb = await ServerModel.create({
      enable: true,
      sv_ip: ip_v4,
      sv_name: hostname,
      type: global.sv_type,
      ...disk,
    });

    if (!saveDb?._id) throw new Error("Error");
    if (platform == "linux") {
      fs.mkdirSync(global.dirPublic, { recursive: true });
    }
    return res.json({ msg: `server ${global.sv_type} created` });
  } catch (err) {
    console.log(err);
    return res.json({ error: true, msg: err?.message });
  }
};

exports.updateDisk = async (req, res) => {
  try {
    const server = await getLocalServer();
    const disk = await get_disk();
    const updateDb = await ServerModel.updateOne(
      {
        _id: server?._id,
        type: global.sv_type,
      },
      {
        ...disk,
      }
    );
    if (!updateDb?.matchedCount) {
      const error = new Error("Someting went worng.");
      error.code = 500;
      throw error;
    }
    return res.status(200).json({ msg: "updated!" });
  } catch (err) {
    return res.status(error?.code || 500).json({
      error: true,
      msg: error?.message,
    });
  }
};
