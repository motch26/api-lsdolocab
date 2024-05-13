const {
  addTypeValue,
  getTypes,
  editTypeValue,
  deleteTypeValue,
} = require("../handlers/types");

module.exports.addTypeValue = async (form) => {
  try {
    const result = await addTypeValue(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getTypes = async () => {
  try {
    const result = await getTypes();
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.editTypeValue = async (form) => {
  try {
    const result = await editTypeValue(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.deleteTypeValue = async (form) => {
  try {
    const result = await deleteTypeValue(form);
    return result;
  } catch (error) {
    return error;
  }
};
