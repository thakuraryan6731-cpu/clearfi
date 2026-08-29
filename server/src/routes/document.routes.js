const express = require("express");
const multer = require("multer");

const {
  uploadDocument,
} = require("../controllers/document.controller");

const authenticateUser = require("../middleware/auth.middleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/",
  authenticateUser,
  upload.single("document"),
  uploadDocument
);

module.exports = router;
