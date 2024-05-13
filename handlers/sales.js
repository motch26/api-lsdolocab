const { ObjectId } = require("mongodb");
const { getDB } = require("../config/dbConnection");
const logger = require("../config/logger");

module.exports.addSale = async (form) => {
  const db = getDB();
  const {
    products,
    paymentMode,
    sessionId,
    isPayable,
    customerName,
    paymentDateExpected,
  } = form;
  let totalAmount = 0;

  try {
    // Compute the totalAmount
    for (let product of products) {
      const productDoc = await db
        .collection("products")
        .findOne({ _id: new ObjectId(product.productId) });
      if (productDoc) {
        // Sort sellPrice by effectiveDate in descending order and pick the first one
        const latestSellPrice = productDoc.sellPrice.sort(
          (a, b) => b.effectiveDate - a.effectiveDate
        )[0];
        let productTotal = latestSellPrice.price * product.count;
        // Apply discount if present
        if (product.discount) {
          productTotal = productTotal * (1 - product.discount);
        }
        totalAmount += productTotal;

        // Check if the product variant has enough stocks left
        const variant = productDoc.variants.find(
          (v) =>
            (v.color === product.variant.color ||
              (v.color === null &&
                (!product.variant || !product.variant.color))) &&
            (v.size === product.variant.size ||
              (v.size === null && (!product.variant || !product.variant.size)))
        );
        logger.info(variant);
        if (!variant || variant.stocks < product.count) {
          throw new Error(
            `Insufficient stocks for product ${productDoc.model}`
          );
        }
      } else {
        throw new Error(`Product ${productDoc.model} not found`);
      }
    }

    const sale = {
      products,
      totalAmount,
      paymentMode,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessionId,
      payable: {
        isPayable: isPayable || false, // default to false if not provided
        customerName: customerName || null, // default to null if not provided
        paymentDateExpected: paymentDateExpected
          ? new Date(paymentDateExpected)
          : null, // parse string to date
        remainingBalance: isPayable ? totalAmount : 0, // add remainingBalance field that defaults to totalAmount if payable, else 0
      },
    };

    const result = await db.collection("sales").insertOne(sale);
    if (result.acknowledged) {
      // Update the products collection for every successful sale
      for (let product of sale.products) {
        let updateQuery = {
          _id: new ObjectId(product.productId),
        };

        if (product.variant && product.variant.color) {
          updateQuery["variants.color"] = product.variant.color;
        } else {
          updateQuery["variants.color"] = null;
        }

        // Check if the product has a size value before adding it to the query
        if (product.variant && product.variant.size) {
          updateQuery["variants.size"] = product.variant.size;
        } else {
          // If the product does not have a size value, set it to null in the query
          updateQuery["variants.size"] = null;
        }

        await db.collection("products").updateOne(updateQuery, {
          $inc: { "variants.$.stocks": -product.count },
        });
      }
    }
    return result;
  } catch (err) {
    logger.error(err.message);
    return { error: err.message };
  }
};

module.exports.getTodaySalesBySession = async (sessionId) => {
  const db = getDB();
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const result = await db
      .collection("sales")
      .find({ sessionId, createdAt: { $gte: startOfDay, $lte: endOfDay } })
      .toArray();

    if (result.length === 0) {
      return { message: `No sales found for session: ${sessionId}` };
    }

    return result;
  } catch (err) {
    logger.error(
      `Error getting sales for session: ${sessionId}. Error: ${err.message}`
    );
    return {
      error: err.message,
    };
  }
};

module.exports.getTodaySales = async () => {
  const db = getDB();
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const sales = await db
      .collection("sales")
      .find({ createdAt: { $gte: startOfDay, $lte: endOfDay } })
      .toArray();
    if (sales.length === 0) {
      return { message: `No sales found for today` };
    }
    let totalAmount = 0;
    for (let sale of sales) {
      // Only add to totalAmount if the sale is not voided
      if (!sale.isVoid) {
        totalAmount += sale.totalAmount;
      }
    }
    return { sales, totalAmount };
  } catch (err) {
    logger.error(`Error getting sales for today. Error: ${err.message}`);
    return {
      error: err.message,
    };
  }
};

module.exports.getSalesByQuery = async (query) => {
  const db = getDB();
  try {
    let filter = {};
    if (query.sessionId) {
      filter.sessionId = query.sessionId;
    }
    if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    } else if (query.currentWeek) {
      const current = new Date();
      const first = current.getDate() - current.getDay();
      const last = first + 6;
      const firstDayOfWeek = new Date(current.setDate(first));
      const lastDayOfWeek = new Date(current.setDate(last));
      filter.createdAt = {
        $gte: firstDayOfWeek,
        $lte: lastDayOfWeek,
      };
    } else if (query.currentMonth) {
      const date = new Date();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      );
      filter.createdAt = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else if (query.currentYear) {
      const date = new Date();
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(date.getFullYear(), 11, 31);
      filter.createdAt = {
        $gte: firstDayOfYear,
        $lte: lastDayOfYear,
      };
    }
    const result = await db
      .collection("sales")
      .find(filter)
      .project({
        products: 1,
        totalAmount: 1,
        paymentMode: 1,
        createdAt: 1,
        updatedAt: 1,
        sessionId: 1,
        isVoid: 1,
      })
      .toArray();
    if (result.length === 0) {
      return { message: `No sales found for the provided query` };
    }
    return { count: result.length, sales: result };
  } catch (err) {
    logger.error(
      `Error getting sales for the provided query. Error: ${err.message}`
    );
    return {
      error: err.message,
    };
  }
};

module.exports.voidSale = async (saleId) => {
  const db = getDB();
  try {
    const sale = await db
      .collection("sales")
      .findOne({ _id: new ObjectId(saleId) });
    if (!sale) {
      throw new Error(`Sale with id: ${saleId} not found`);
    }
    // Return the products to the stock
    for (let product of sale.products) {
      let updateQuery = {
        _id: new ObjectId(product.productId),
      };
      if (product.variant && product.variant.color) {
        updateQuery["variants.color"] = product.variant.color;
      } else {
        updateQuery["variants.color"] = null;
      }
      if (product.variant && product.variant.size) {
        updateQuery["variants.size"] = product.variant.size;
      } else {
        updateQuery["variants.size"] = { $exists: true, $eq: null };
      }
      let productToUpdate = await db
        .collection("products")
        .findOne(updateQuery);
      if (productToUpdate) {
        let variantIndex = productToUpdate.variants.findIndex(
          (v) =>
            (v.color || null) === (product.variant && product.variant.color) &&
            ((v.size || null) === (product.variant && product.variant.size) ||
              (v.size === null && !(product.variant && product.variant.size)))
        );
        if (variantIndex !== -1) {
          let update = { $inc: {} };
          update.$inc[`variants.${variantIndex}.stocks`] = product.count;
          await db.collection("products").updateOne(updateQuery, update);
        }
      }
    }
    // Only set isVoid to true if all processes are successful
    const result = await db
      .collection("sales")
      .updateOne({ _id: new ObjectId(saleId) }, { $set: { isVoid: true } });
    if (result.modifiedCount === 0) {
      throw new Error(`Failed to void sale with id: ${saleId}`);
    }
    return { message: `Sale with id: ${saleId} has been voided` };
  } catch (err) {
    logger.error(
      `Error voiding sale with id: ${saleId}. Error: ${err.message}`
    );
    return { error: err.message };
  }
};

module.exports.payForPayable = async (saleId, payment) => {
  const db = getDB();
  try {
    const sale = await db
      .collection("sales")
      .findOne({ _id: new ObjectId(saleId) });
    if (!sale) {
      throw new Error(`Sale with id: ${saleId} not found`);
    }
    if (!sale.payable.isPayable) {
      throw new Error(`Sale with id: ${saleId} is not payable`);
    }
    // Add payment to the payment history
    sale.payable.payments = sale.payable.payments || [];
    sale.payable.payments.push({
      amount: payment.amount,
      date: new Date(),
      mode: payment.mode,
    });
    // Update the payable status and calculate the remaining balance if the total payments cover the total amount
    let totalPayments = sale.payable.payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
    sale.payable.remainingBalance = sale.totalAmount - totalPayments;
    if (totalPayments >= sale.totalAmount) {
      sale.payable.isPayable = false;
      sale.payable.remainingBalance = 0;
    }
    const result = await db
      .collection("sales")
      .updateOne(
        { _id: new ObjectId(saleId) },
        { $set: { payable: sale.payable } }
      );
    if (result.modifiedCount === 0) {
      throw new Error(`Failed to update payment for sale with id: ${saleId}`);
    }
    return {
      message: `Payment for sale with id: ${saleId} has been updated`,
      remainingBalance: sale.payable.remainingBalance,
    };
  } catch (err) {
    logger.error(
      `Error updating payment for sale with id: ${saleId}. Error: ${err.message}`
    );
    return {
      error: err.message,
    };
  }
};

module.exports.getPayables = async ({userId}) => {
  const db = getDB();
  try {
    // Get all sessionIds for the given userId
    const sessions = await db.collection("sessions").find({ userId }).toArray();
    const sessionIds = sessions.map(session => session._id.toString());

    let filter = {
      "payable.isPayable": true,
      "payable.remainingBalance": { $gt: 0 },
      "sessionId": { $in: sessionIds }
    };

    const sales = await db.collection("sales").find(filter).toArray();
    sales.forEach((sale) => {
      const dueDate = new Date(sale.payable.paymentDateExpected);
      const currentDate = new Date();
      sale.payable.status = currentDate > dueDate ? "overdue" : "pending";
    });
    return sales;
  } catch (err) {
    logger.error(`Error getting pending payables. Error: ${err.message}`);
    return {
      error: err.message,
    };
  }
};
