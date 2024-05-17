const { error } = require("winston");
const { getDB } = require("../config/dbConnection");
const { ObjectId } = require("mongodb");

module.exports.addProduct = async (form) => {
  try {
    const db = getDB();
    const {
      model,
      brand,
      buyPrice,
      sellPrice,
      colors,
      updatedBy,
      category,
      useFor,
    } = form;

    const product = {
      model,
      brand,
      colors: JSON.parse(colors),
      variants: [],
      category,
      useFor: JSON.parse(useFor),
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      sellPrice: [
        {
          price: parseInt(sellPrice),
          effectiveDate: new Date(),
        },
      ],
      buyPrice: [
        {
          price: parseInt(buyPrice),
          effectiveDate: new Date(),
        },
      ],
    };

    JSON.parse(colors).forEach((color) => {
      const { name, sizes } = color;
      const variantSizes = [];
      if (sizes.men && sizes.women) {
        for (let size = 36; size <= 46; size++) {
          variantSizes.push(size.toString());
        }
      } else if (sizes.men) {
        for (let size = 40; size <= 46; size++) {
          variantSizes.push(size.toString());
        }
      } else if (sizes.women) {
        for (let size = 36; size <= 40; size++) {
          variantSizes.push(size.toString());
        }
      } else {
        variantSizes.push(null);
      }

      variantSizes.forEach((size) => {
        product.variants.push({
          _id: new ObjectId(),
          color: name,
          size,
          stocks: 0,
        });
      });
    });

    const duplicateProduct = await db
      .collection("products")
      .findOne({ model, brand });
    if (duplicateProduct) {
      throw new Error("Duplicate product");
    }
    const result = await db.collection("products").insertOne(product);
    if (result.acknowledged) {
      // Fetch the inserted document from the database
      const insertedProduct = await db
        .collection("products")
        .findOne({ _id: result.insertedId });
      return {
        message: "Product added successfully",
        product: insertedProduct,
      };
    }
  } catch (err) {
    return {
      error: err.message,
    };
  }
};

module.exports.getProduct = async (_id) => {
  const db = getDB();
  try {
    const result = await db
      .collection("products")
      .findOne({ _id: new ObjectId(_id) });
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.editProduct = async (form) => {
  try {
    const db = getDB();
    const {
      _id,
      model,
      brand,
      colors,
      updatedBy,
      category,
      useFor,
      sellPrice,
      buyPrice,
    } = form;

    const existingProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(_id) });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    let product = {
      updatedAt: new Date(),
    };

    if (model) product.model = model;
    if (brand) product.brand = brand;
    if (updatedBy) product.updatedBy = updatedBy;
    if (category) product.category = category;
    if (useFor) product.useFor = useFor;

    if (colors) {
      product.colors = colors;
      product.variants = [];

      colors.forEach((color) => {
        const { name, sizes } = color;
        const variantSizes = [];

        if (sizes.men && sizes.women) {
          for (let size = 36; size <= 46; size++) {
            variantSizes.push(size.toString());
          }
        } else if (sizes.men) {
          for (let size = 40; size <= 46; size++) {
            variantSizes.push(size.toString());
          }
        } else if (sizes.women) {
          for (let size = 36; size <= 40; size++) {
            variantSizes.push(size.toString());
          }
        } else {
          variantSizes.push(null);
        }

        variantSizes.forEach((size) => {
          const existingVariant = existingProduct.variants.find(
            (variant) => variant.color === name && variant.size === size
          );

          const stocks = existingVariant ? existingVariant.stocks : 0;

          product.variants.push({
            _id: existingVariant ? existingVariant._id : new ObjectId(),
            color: name,
            size,
            stocks,
          });
        });
      });

      // Remove variants that no longer exist in colors
      existingProduct.variants = existingProduct.variants.filter((variant) =>
        product.colors.some(
          (color) => color.name === variant.color && color.sizes[variant.size]
        )
      );
    }

    if (
      sellPrice &&
      existingProduct.sellPrice[existingProduct.sellPrice.length - 1].price !==
        sellPrice
    ) {
      product.sellPrice = existingProduct.sellPrice;
      product.sellPrice.push({
        price: sellPrice,
        effectiveDate: new Date(),
      });
    }

    if (
      buyPrice &&
      existingProduct.buyPrice[existingProduct.buyPrice.length - 1].price !==
        buyPrice
    ) {
      product.buyPrice = existingProduct.buyPrice;
      product.buyPrice.push({
        price: buyPrice,
        effectiveDate: new Date(),
      });
    }

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(_id) }, { $set: product });

    if (result.modifiedCount === 0) {
      throw new Error("No changes were made to the product");
    }

    return {
      message: "Product updated successfully",
      result,
    };
  } catch (err) {
    return {
      error: err.message,
    };
  }
};

module.exports.deleteProduct = async (_id) => {
  const db = getDB();
  try {
    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(_id) });
    if (result.deletedCount === 1) {
      return { message: "Product deleted successfully" };
    } else {
      throw new Error("Product not found");
    }
  } catch (err) {
    return { error: err.message };
  }
};

module.exports.getProducts = async () => {
  const db = getDB();
  try {
    const result = await db.collection("products").find({}).toArray();
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.searchProducts = async (findQuery, projection, sort) => {
  const db = getDB();
  try {
    const result = await db
      .collection("products")
      .find(findQuery, { projection })
      .sort(sort)
      .toArray();
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.editProductVariants = async (form) => {
  const db = getDB();
  const { _id, updatedBy, variants } = form;

  try {
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(_id) });
    if (!product) {
      throw new Error("Product not found");
    }

    await db.collection("products").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: { variants, updatedAt: new Date(), updatedBy },
      }
    );

    return { message: "Variants added successfully" };
  } catch (err) {
    return err;
  }
};

module.exports.addProductImages = async (_id, images) => {
  const db = getDB();

  try {
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(_id) });
    if (!product) {
      throw new Error("Product not found");
    }

    await db.collection("products").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: { images },
      }
    );
  } catch (err) {
    return err;
  }
};

module.exports.editVariantStocks = async (form) => {
  const db = getDB();
  const { _id, updatedBy, variantId, stocks } = form;
  console.log(form);

  try {
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(_id) });
    if (!product) {
      throw new Error("Product not found");
    }

    const variantIndex = product.variants.findIndex(
      (variant) => variant._id.toString() === variantId
    );
    if (variantIndex === -1) {
      throw new Error("Variant not found");
    }

    product.variants[variantIndex].stocks = stocks;

    await db.collection("products").updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: { variants: product.variants, updatedAt: new Date(), updatedBy },
      }
    );

    return { message: "Stocks updated successfully" };
  } catch (err) {
    return { error: err.message };
  }
};
