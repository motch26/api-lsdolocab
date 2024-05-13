const express = require("express");
const {
  getCargos,
  getCargo,
  addCargo,
  editCargo,
  deleteCargo,
  searchCargos,
  receiveCargo,
} = require("../controllers/cargos");
const router = express.Router();

router.get("/getCargos", async (req, res, next) => {
  try {
    const result = await getCargos();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/addCargo", async (req, res, next) => {
  try {
    const result = await addCargo(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/getCargo", async (req, res, next) => {
  try {
    const result = await getCargo(req.query._id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/editCargo", async (req, res, next) => {
  try {
    const result = await editCargo(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/deleteCargo", async (req, res, next) => {
  try {
    const result = await deleteCargo(req.body._id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/searchCargos", async (req, res, next) => {
  try {
    const result = await searchCargos(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/receiveCargo", async (req, res, next) => {
  try {
    const result = await receiveCargo(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
