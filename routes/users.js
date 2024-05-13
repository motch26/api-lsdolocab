const express = require("express");
const router = express.Router();

const {
  addUser,
  getUser,
  editUser,
  deleteUser,
  getUsers,
  login,
  resetPassword,
  searchUsers,
} = require("../controllers/users");

router.post("/addUser", async (req, res, next) => {
  try {
    const result = await addUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/getUser", async (req, res, next) => {
  try {
    const result = await getUser(req.query.username);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/editUser", async (req, res, next) => {
  try {
    const result = await editUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/deleteUser", async (req, res, next) => {
  try {
    const result = await deleteUser(req.body._id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/getUsers", async (req, res, next) => {
  try {
    const result = await getUsers();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/login", async (req, res, next) => {
  try {
    const result = await login(req.query.username, req.query.password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/resetPassword", async (req, res, next) => {
  try {
    const result = await resetPassword(req.body.username);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/searchUsers", async (req, res, next) => {
  try {
    const result = await searchUsers(req.query.search);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
