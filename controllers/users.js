const {
  addUser,
  getUser,
  editUser,
  deleteUser,
  getUsers,
  login,
  resetPassword,
  searchUsers,
} = require("../handlers/users");

module.exports.addUser = async (form) => {
  try {
    const result = await addUser(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getUser = async (username) => {
  try {
    const result = await getUser(username);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.editUser = async (form) => {
  try {
    const result = await editUser(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.deleteUser = async (_id) => {
  try {
    const result = await deleteUser(_id);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getUsers = async () => {
  try {
    const result = await getUsers();
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.login = async (username, password) => {
  try {
    const result = await login(username, password);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.resetPassword = async (username) => {
  try {
    const result = await resetPassword(username);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.searchUsers = async (query) => {
  try {
    const result = await searchUsers(query);
    return result;
  } catch (error) {
    return error;
  }
};
