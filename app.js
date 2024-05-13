require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var morgan = require("morgan");
const cors = require("cors");
const options = require("./config/corsOption");
const logger = require("./config/logger");

var indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const cargosRouter = require("./routes/cargos");
const typesRouter = require("./routes/types");
const sessionsRouter = require("./routes/sessions");
const salesRouter = require("./routes/sales");

var app = express();

app.use(cors(options));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/cargos", cargosRouter);
app.use("/types", typesRouter);
app.use("/sessions", sessionsRouter);
app.use("/sales", salesRouter);

app.use("*", (req, res) => {
  res.status(404).json({ msg: "Not Found" });
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ err: err.message });
});

module.exports = app;
