const {
  addProduct,
  getProduct,
  editProduct,
  deleteProduct,
  getProducts,
  searchProducts,
  addProductImages,
  editProductVariants,
  editVariantStocks,
} = require("../handlers/products");
const { uploadFiles } = require("../utils/uploads");

module.exports.addProduct = async (req, res) => {
  try {
    const form = req.body;
    const files = req.files;
    const product = await addProduct(form);
    if (product.error) {
      throw new Error(product.error);
    }
    const images = await uploadFiles(files, product.product);
    await addProductImages(product.product._id, images);
    return {
      product,
      message: "Product added successfully",
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};
module.exports.getProduct = async (_id) => {
  try {
    const result = await getProduct(_id);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.editProduct = async (form) => {
  try {
    const result = await editProduct(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.deleteProduct = async (_id) => {
  try {
    console.log(_id);
    const result = await deleteProduct(_id);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.getProducts = async () => {
  try {
    const result = await getProducts();
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.searchProducts = async (query) => {
  try {
    const { searchText, color, brand, hasStocks, category, useFor } = query;

    let findQuery = {};
    let projection = {};
    let sort = {};

    if (searchText || brand) {
      findQuery.$text = { $search: searchText };
      projection.score = { $meta: "textScore" };
      sort.score = { $meta: "textScore" };
    }
    if (brand) {
      findQuery.brand = brand;
    }
    if (category) {
      findQuery.category = category;
    }
    if (color) {
      findQuery.variants = {
        $elemMatch: { color },
      };
    }
    if (parseInt(hasStocks)) {
      findQuery.variants = {
        $elemMatch: { stocks: { $gt: 0 } },
      };
    }
    if (category) {
      findQuery.category = category;
    }
    if (useFor) {
      findQuery.useFor = { $in: [useFor] };
    }
    const result = await searchProducts(findQuery, projection, sort);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.editProductVariants = async (form) => {
  try {
    const result = await editProductVariants(form);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports.editVariantStocks = async (form) => {
  try {
    const result = await editVariantStocks(form);
    return result;
  } catch (error) {
    return error;
  }
};
