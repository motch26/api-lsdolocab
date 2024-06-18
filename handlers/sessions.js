const { ObjectId } = require("mongodb");
const { getDB } = require("../config/dbConnection");
module.exports.startSession = async (form) => {
  try {
    const db = getDB();
    const { userId, name, startingMoney } = form;

    // Check if there's an open session for the user
    const openSession = await db.collection("sessions").findOne({
      userId,
      status: "open",
    });
    if (openSession) {
      throw new Error("There is already an open session for this user.");
    }

    // If no name is provided, generate a name
    let sessionName = name;
    if (!sessionName) {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDate()}`;

      // Get the number of sessions started today
      const sessionsToday = await db.collection("sessions").countDocuments({
        createdAt: {
          $gte: new Date(dateStr),
          $lt: new Date(dateStr + "T23:59:59.999Z"),
        },
      });

      // Generate session name with session number
      sessionName = `Session ${dateStr}-${sessionsToday + 1}`;
    }

    // Check if a session with the same name already exists on the same date
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;
    const existingSession = await db.collection("sessions").findOne({
      name: { $regex: new RegExp(`^${sessionName.toLowerCase()}$`, "i") },
      createdAt: {
        $gte: new Date(dateStr),
        $lt: new Date(dateStr + "T23:59:59.999Z"),
      },
    });
    if (existingSession) {
      throw new Error("A session with this name already exists on this date.");
    }

    const session = {
      userId,
      name: sessionName,
      startingMoney: parseFloat(startingMoney) || 0, // Convert starting money to a float value, default to 0 if not provided
      balance: parseFloat(startingMoney) || 0, // Add balance field with starting value of startingMoney
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "open",
    };

    const result = await db.collection("sessions").insertOne(session);

    if (!result.insertedId) {
      throw new Error("Failed to start session.");
    }

    return {
      message: "Session started successfully.",
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

module.exports.endSession = async (form) => {
  try {
    const db = getDB();
    const { sessionId, endMoney } = form;
    const session = await db.collection("sessions").findOne({
      _id: new ObjectId(sessionId),
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    if (session.status === "closed") {
      throw new Error("Session is already closed.");
    }

    const result = await db.collection("sessions").updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $set: {
          status: "closed",
          endMoney: endMoney, // Add end of the session money
          updatedAt: new Date(),
        },
      }
    );

    if (!result.acknowledged) {
      throw new Error("Failed to close session.");
    }

    return {
      message: "Session closed successfully.",
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

module.exports.getSessions = async (userId) => {
  try {
    const db = getDB();
    const sessions = await db
      .collection("sessions")
      .find({ userId })
      .sort({ status: 1, createdAt: -1 }) // Sort by status first (open sessions will come first), then by createdAt
      .toArray();

    return sessions;
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

module.exports.getSession = async (sessionId) => {
  try {
    const db = getDB();
    const session = await db.collection("sessions").findOne({
      _id: new ObjectId(sessionId),
    });

    return session;
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

module.exports.getOpenSession = async (userId) => {
  try {
    const db = getDB();
    const session = await db.collection("sessions").findOne({
      userId,
      status: "open",
    });

    return session;
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

module.exports.deleteSession = async (sessionId) => {
  console.log(sessionId);
  try {
    const db = getDB();
    const session = await db.collection("sessions").findOne({
      _id: new ObjectId(sessionId),
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    const today = new Date();
    const sessionDate = new Date(session.createdAt);
    if (
      sessionDate.getDate() !== today.getDate() ||
      sessionDate.getMonth() !== today.getMonth() ||
      sessionDate.getFullYear() !== today.getFullYear()
    ) {
      throw new Error("Cannot delete sessions from previous days.");
    }

    const result = await db
      .collection("sessions")
      .deleteOne({ _id: new ObjectId(sessionId) });

    if (!result.deletedCount) {
      throw new Error("Failed to delete session.");
    }

    return {
      message: "Session deleted successfully.",
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

module.exports.editSession = async (form) => {
  try {
    const db = getDB();
    const { sessionId, name, startingMoney } = form;
    const session = await db.collection("sessions").findOne({
      _id: new ObjectId(sessionId),
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    if (session.status === "closed") {
      throw new Error("Cannot edit a closed session.");
    }

    const today = new Date();
    const sessionDate = new Date(session.createdAt);
    if (
      sessionDate.getDate() !== today.getDate() ||
      sessionDate.getMonth() !== today.getMonth() ||
      sessionDate.getFullYear() !== today.getFullYear()
    ) {
      throw new Error("Cannot edit sessions from previous days.");
    }

    const update = {
      updatedAt: new Date(),
    };
    if (name) {
      update.name = name;
    }
    if (startingMoney) {
      update.startingMoney = startingMoney;
    }

    const result = await db
      .collection("sessions")
      .updateOne({ _id: new ObjectId(sessionId) }, { $set: update });

    return result;
  } catch (error) {
    return {
      error: error.message,
    };
  }
};
