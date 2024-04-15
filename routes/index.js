"use strict";
const express = require("express");
const { getEmbed } = require("../controllers/embed.controllers");
const router = express.Router();

router.get("/embed/:slug", getEmbed);
router.get("/v/:slug", getEmbed);

router.use("/server", require("./server.routes"));

router.all("*", async (req, res) => {
  return res.status(404).json({ error: true, msg: "not found!" });
});

module.exports = router;
