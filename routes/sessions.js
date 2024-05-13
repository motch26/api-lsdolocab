const express = require("express");
const router = express.Router();
const {
  startSession,
  endSession,
  getSessions,
  getSession,
  getOpenSession,
  deleteSession,
  editSession,
} = require("../controllers/sessions");

router.post("/startSession", async (req, res, next) => {
  try {
    const result = await startSession(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/endSession", async (req, res, next) => {
  try {
    const result = await endSession(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/getSessions", async (req, res, next) => {
  try {
    const result = await getSessions(req.query.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/getSession", async (req, res, next) => {
  try {
    const result = await getSession(req.query.sessionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/getOpenSession", async (req, res, next) => {
  try {
    const result = await getOpenSession(req.query.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/deleteSession", async (req, res, next) => {
  try {
    const result = await deleteSession(req.query.sessionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/editSession", async (req, res, next) => {
  try {
    const result = await editSession(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
