const express = require("express");
const router = express.Router();
const {
  addTypeValue,
  getTypes,
  editTypeValue,
  deleteTypeValue,
} = require("../controllers/types");

router.post("/addTypeValue", async (req, res) => {
  const result = await addTypeValue(req.body);
  res.json(result);
});

router.get("/getTypes", async (req, res) => {
  const result = await getTypes();
  res.json(result);
});

router.put("/editTypeValue", async (req, res) => {
  const result = await editTypeValue(req.body);
  res.json(result);
});

router.delete("/deleteTypeValue", async (req, res) => {
  const result = await deleteTypeValue(req.body);
  res.json(result);
});

module.exports = router;
