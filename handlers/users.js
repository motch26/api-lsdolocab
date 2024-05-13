const { ObjectId } = require("mongodb");
const { getDB } = require("../config/dbConnection");

module.exports.addUser = async (form) => {
  const db = getDB();
  const { username, password, name, accessRoles } = form;
  const user = {
    username,
    password,
    name,
    accessRoles,
    createdAt: new Date(),
    updatedAt: new Date(),
    active: true, // Added active field
  };
  try {
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      throw new Error("Username already exists");
    }
    const result = await db.collection("users").insertOne(user);
    return { message: "User added successfully", result };
  } catch (err) {
    return { error: err.message };
  }
};

module.exports.getUser = async (username) => {
  const db = getDB();
  try {
    const result = await db.collection("users").findOne({ username });
    if (result && result.accessRoles) {
      result.accessRoles.sort();
    }
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.login = async (username, password) => {
  const db = getDB();
  try {
    const user = await db.collection("users").findOne({ username, password });
    if (!user) {
      throw new Error("Invalid username or password");
    }
    return user;
  } catch (err) {
    return {
      error: err.message,
    };
  }
};

module.exports.editUser = async (form) => {
  const db = getDB();
  const { username, password, name, accessRoles } = form;
  let user = {
    updatedAt: new Date(),
  };
  if (password) {
    user.password = password;
  }
  if (name) {
    user.name = name;
  }
  if (accessRoles) {
    user.accessRoles = accessRoles;
  }
  try {
    const existingUser = await db.collection("users").findOne({ username });
    if (!existingUser) {
      throw new Error("User not found");
    }
    await db.collection("users").updateOne({ username }, { $set: user });
    const updatedUser = await db.collection("users").findOne({ username });
    return { message: "User updated successfully", user: updatedUser };
  } catch (err) {
    logger.error(err.message);
    return { error: err.message };
  }
};

module.exports.deleteUser = async (_id) => {
  console.log(_id);
  const db = getDB();
  try {
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(_id) }, { $set: { active: false } });
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.getUsers = async () => {
  const db = getDB();
  try {
    const result = await db
      .collection("users")
      .find({ active: { $ne: false } })
      .toArray();
    // Sort accessRoles array items alphabetically for each user
    result.forEach((user) => {
      if (user.accessRoles) {
        user.accessRoles.sort();
      }
    });
    return result;
  } catch (err) {
    return err;
  }
};

module.exports.resetPassword = async (username) => {
  const db = getDB();
  try {
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      throw new Error("User not found");
    } else {
      // Generate a random alphanumeric string of length 8
      const password = Math.random().toString(36).slice(-8);
      await db.collection("users").updateOne(
        {
          username,
        },
        {
          $set: {
            password,
            updatedAt: new Date(),
          },
        }
      );
      return {
        message: `Password reset successful. New password is ${password}`,
        password,
      };
    }
  } catch (err) {
    return {
      error: err.message,
    };
  }
};

module.exports.searchUsers = async (search) => {
  const db = getDB();
  try {
    const result = await db
      .collection("users")
      .find({
        $text: { $search: search }
      })
      .toArray();
    return result;
  } catch (err) {
    return err;
  }
};
