const express = require("express");
const router = express.Router();
const {
  addSale,
  getTodaySalesBySession,
  getTodaySales,
  getSalesByQuery,
  voidSale,
  payForPayable,
  getPayables,
} = require("../controllers/sales");

router.post("/addSale", async (req, res, next) => {
  try {
    const result = await addSale(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.get("/getTodaySalesBySession", async (req, res, next) => {
  try {
    const result = await getTodaySalesBySession(req.query.sessionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.get("/getTodaySales", async (req, res, next) => {
  try {
    const result = await getTodaySales();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.get("/getSalesByQuery", async (req, res, next) => {
  try {
    const result = await getSalesByQuery(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.put("/voidSale", async (req, res, next) => {
  try {
    const result = await voidSale(req.body.saleId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.put("/payForPayable", async (req, res, next) => {
  try {
    const result = await payForPayable(req.body.saleId, req.body.payment);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.get("/getPayables", async (req, res, next) => {
  try {
    const result = await getPayables(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
