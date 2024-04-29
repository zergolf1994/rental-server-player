"use strict";
const express = require("express");
const router = express.Router();


const { getEmbed } = require("../controllers/embed.controllers");
const { testUa } = require("../controllers/test.controllers");

router.get("/embed/:slug", getEmbed);
router.get("/v/:slug", getEmbed);

router.get("/test-ua", testUa);

router.use("/server", require("./server.routes"));

router.all("*", async (req, res) => {
  return res.status(404).json({ error: true, msg: "not found!" });
});

module.exports = router;
