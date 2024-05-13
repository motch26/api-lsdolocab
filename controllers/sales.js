const logger = require("../config/logger");
const {
  addSale,
  getTodaySalesBySession,
  getTodaySales,
  getSalesByQuery,
  voidSale,
  payForPayable,
  getPayables,
} = require("../handlers/sales");

module.exports.addSale = async (form) => {
  try {
    const result = await addSale(form);
    return result;
  } catch (error) {
    return error;
  }
};
module.exports.getTodaySalesBySession = async (sessionId) => {
  try {
    const result = await getTodaySalesBySession(sessionId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getTodaySales = async () => {
  try {
    const result = await getTodaySales();
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getSalesByQuery = async (query) => {
  try {
    const result = await getSalesByQuery(query);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.voidSale = async (saleId) => {
  try {
    const result = await voidSale(saleId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.payForPayable = async (saleId, payment) => {
  try {
    const result = await payForPayable(saleId, payment);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getPayables = async (query) => {
  try {
    const result = await getPayables(query);
    return result;
  } catch (error) {
    return error;
  }
};
