const {
  startSession,
  endSession,
  getSessions,
  getSession,
  getOpenSession,
  deleteSession,
  editSession,
} = require("../handlers/sessions");

module.exports.startSession = async (form) => {
  try {
    const result = await startSession(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.endSession = async (form) => {
  try {
    const result = await endSession(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getSessions = async (userId) => {
  try {
    const result = await getSessions(userId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getSession = async (sessionId) => {
  try {
    const result = await getSession(sessionId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getOpenSession = async (userId) => {
  try {
    const result = await getOpenSession(userId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.deleteSession = async (sessionId) => {
  try {
    const result = await deleteSession(sessionId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.editSession = async (form) => {
  try {
    const result = await editSession(form);
    return result;
  } catch (error) {
    return error;
  }
};
