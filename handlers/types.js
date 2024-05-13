const { getDB } = require("../config/dbConnection");
const { ObjectId } = require("mongodb");

module.exports.addTypeValue = async (form) => {
  try {
    const db = getDB();
    const { entryName, typeName, createdBy, color } = form;
    const collection = db.collection("types");

    const value = {
      _id: new ObjectId(),
      name: entryName,
      createdBy,
      createdAt: new Date(),
    };
    if (color) {
      value.color = color;
    }

    const result = await collection.updateOne(
      { name: typeName },
      { $push: { values: value } }
    );

    if (result.modifiedCount > 0) {
      return { message: "Type value added successfully" };
    } else {
      return { message: "Failed to add type value" };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getTypes = async () => {
  const db = getDB();
  const collection = db.collection("types");
  const result = await collection.find().toArray();
  return result;
};

module.exports.editTypeValue = async (form) => {
  try {
    const db = getDB();
    const collection = db.collection("types");
    const { typeName, entryName, color, _id } = form;
    const result = await collection.updateOne(
      { name: typeName, "values._id": new ObjectId(_id) },
      { $set: { "values.$.name": entryName, "values.$.color": color } }
    );
    if (result.modifiedCount > 0) {
      return { message: "Type value updated successfully" };
    } else {
      return { message: "No type value found to update" };
    }
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

module.exports.deleteTypeValue = async (form) => {
  const db = getDB();
  const collection = db.collection("types");
  const { typeName, _id } = form;
  const result = await collection.updateOne(
    { name: typeName },
    { $pull: { values: { _id: new ObjectId(_id) } } }
  );
  if (result.modifiedCount > 0) {
    return { message: "Type value deleted successfully" };
  } else {
    return { message: "No type value found to delete" };
  }
};
