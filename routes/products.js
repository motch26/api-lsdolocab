const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProduct,
  editProduct,
  deleteProduct,
  getProducts,
  searchProducts,
  editProductVariants,
  editVariantStocks,
} = require("../controllers/products");
const multerConfig = require("../config/multerConfig");

router.post(
  "/addProduct",
  multerConfig.array("images"),
  async (req, res, next) => {
    try {
      const result = await addProduct(req, res);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/getProduct", async (req, res, next) => {
  try {
    const result = await getProduct(req.query._id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/editProduct", async (req, res, next) => {
  try {
    const result = await editProduct(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.delete("/deleteProduct", async (req, res, next) => {
  try {
    const result = await deleteProduct(req.body._id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/getProducts", async (req, res, next) => {
  try {
    const result = await getProducts();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/searchProducts", async (req, res, next) => {
  try {
    const result = await searchProducts(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/editProductVariants", async (req, res, next) => {
  try {
    const result = await editProductVariants(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/editVariantStocks", async (req, res, next) => {
  try {
    const result = await editVariantStocks(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
