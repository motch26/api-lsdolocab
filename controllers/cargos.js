const { log } = require("winston");
const logger = require("../config/logger");
const {
  addCargo,
  getCargo,
  editCargo,
  getCargos,
  deleteCargo,
  searchCargos,
  receiveCargo,
} = require("../handlers/cargos");

module.exports.addCargo = async (form) => {
  try {
    const result = await addCargo(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getCargo = async (_id) => {
  try {
    const result = await getCargo(_id);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.editCargo = async (form) => {
  try {
    const result = await editCargo(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.deleteCargo = async (_id) => {
  try {
    const result = await deleteCargo(_id);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getCargos = async () => {
  try {
    const result = await getCargos();
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.searchCargos = async (query) => {
  try {
    const { searchText, courier, received, dateStart, dateEnd } = query;
    let findQuery = {};

    if (searchText) {
      findQuery.$text = { $search: searchText };
    }
    if (courier) {
      findQuery.courier = courier;
    }
    if (received) {
      findQuery.received = Boolean(parseInt(received));
    }
    if (dateStart && dateEnd) {
      findQuery.createdAt = {
        $gte: new Date(dateStart),
        $lt: new Date(dateEnd),
      };
    }
    const result = await searchCargos(findQuery);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.receiveCargo = async (body) => {
  try {
    const result = await receiveCargo(body);
    return result;
  } catch (error) {
    return error;
  }
};
