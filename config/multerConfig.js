const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("tmp"));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const multerConfig = multer({ storage: storage });

module.exports = multerConfig;
