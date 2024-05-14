"use strict";
const express = require("express");
const router = express.Router();


const { getEmbed, getVembed } = require("../controllers/embed.controllers");
const { testUa, testVideo } = require("../controllers/test.controllers");

router.get("/embed/:slug", getEmbed);
router.get("/v/:slug", getVembed);

router.get("/test-ua", testUa);
router.get("/test", testVideo);

router.use("/server", require("./server.routes"));

router.all("*", async (req, res) => {
  return res.status(404).json({ error: true, msg: "not found!" });
});

module.exports = router;
