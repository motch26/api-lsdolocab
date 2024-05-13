const { ObjectId } = require("mongodb");
const { getDB } = require("../config/dbConnection");

module.exports.addCargo = async (form) => {
  const db = getDB();
  const {
    name,
    products,
    courier,
    productsExpenses,
    otherExpenses,
    totalExpenses,
    updatedBy,
  } = form;

  // If no name is provided, generate a default name
  let cargoName = name;
  if (!name) {
    const date = new Date();
    const dateString = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`;
    const cargoCountForToday = await db.collection("cargos").countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });
    cargoName = `Cargo-${dateString}-${cargoCountForToday + 1}`;
  }

  const cargo = {
    name: cargoName,
    products,
    courier,
    received: false, // Set received to false by default
    productsExpenses,
    otherExpenses,
    totalExpenses,
    updatedBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  try {
    const result = await db.collection("cargos").insertOne(cargo);
    return { success: true, message: "Cargo added successfully" };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

module.exports.getCargo = async (_id) => {
  const db = getDB();
  try {
    const result = await db
      .collection("cargos")
      .findOne({ _id: new ObjectId(_id) });
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.editCargo = async (form) => {
  const db = getDB();
  const {
    _id,
    name,
    products,
    courier,
    received,
    productsExpenses,
    otherExpenses,
    totalExpenses,
    updatedBy,
  } = form;

  let cargo = {
    updatedAt: new Date(),
  };

  if (name !== undefined) cargo.name = name;
  if (products !== undefined) cargo.products = products;
  if (courier !== undefined) cargo.courier = courier;
  if (received !== undefined) cargo.received = received;
  if (productsExpenses !== undefined) cargo.productsExpenses = productsExpenses;
  if (otherExpenses !== undefined) cargo.otherExpenses = otherExpenses;
  if (totalExpenses !== undefined) cargo.totalExpenses = totalExpenses;
  if (updatedBy !== undefined) cargo.updatedBy = updatedBy;

  try {
    const result = await db
      .collection("cargos")
      .updateOne({ _id: new ObjectId(_id) }, { $set: cargo });
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.deleteCargo = async (_id) => {
  const db = getDB();
  try {
    const result = await db
      .collection("cargos")
      .deleteOne({ _id: new ObjectId(_id) });
    return { message: "Cargo unreserved successfully" };
  } catch (err) {
    return { error: err.message };
  }
};

module.exports.getCargos = async () => {
  const db = getDB();
  try {
    const result = await db
      .collection("cargos")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    // Populate the product model for each cargo
    for (let cargo of result) {
      for (let product of cargo.products) {
        const dbProduct = await db
          .collection("products")
          .findOne({ _id: new ObjectId(product._id) });
        if (dbProduct) {
          product.model = dbProduct.model;
        }
      }
    }
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.searchCargos = async (findQuery) => {
  const db = getDB();

  try {
    const result = await db.collection("cargos").find(findQuery).toArray();
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.receiveCargo = async (body) => {
  const db = getDB();
  const { _id, products } = body;
  try {
    const cargo = await db
      .collection("cargos")
      .findOne({ _id: new ObjectId(_id) });
    if (!cargo) {
      throw new Error("Cargo not found");
    }

    if (cargo.received) {
      throw new Error("Cargo already received");
    }

    // Iterate over each product in the cargo
    for (let product of products) {
      // Get the corresponding product from the products collection
      const dbProduct = await db
        .collection("products")
        .findOne({ _id: new ObjectId(product._id) });
      if (!dbProduct) {
        throw new Error("Product not found");
      }

      // Iterate over each variant in the product
      for (let variant of product.variants) {
        // Check if the variant already exists in the product
        const existingVariant = dbProduct.variants.find(
          (v) =>
            v.color === variant.color && (!v.size || v.size === variant.size)
        );
        if (existingVariant) {
          // If the variant exists, add the stock
          existingVariant.stocks += variant.stocks;
        } else {
          // If the variant does not exist, add it to the product
          dbProduct.variants.push({
            color: variant.color || null,
            size: variant.size || null,
            stocks: variant.stocks,
          });
        }
      }

      // Update the product in the database
      await db
        .collection("products")
        .updateOne({ _id: new ObjectId(product._id) }, { $set: dbProduct });
    }

    // Mark the cargo as received
    await db
      .collection("cargos")
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { received: true, updatedAt: new Date() } }
      );

    return { message: "Cargo received successfully" };
  } catch (err) {
    return { error: err.message };
  }
};
