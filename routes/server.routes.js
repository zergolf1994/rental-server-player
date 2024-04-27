"use strict";
const express = require("express");
const router = express.Router();
const { serverDetail, serverCreate, updateDisk, domainConnect } = require("../controllers/server.controllers");

router.get("/detail", serverDetail);
router.get("/create", serverCreate);
router.get("/disk-update", updateDisk);

router.get("/connect", domainConnect);

module.exports = router;
