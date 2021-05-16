const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRoutes");
const transactionRouter = require("./routes/transactionRoutes");
const errorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();

app.enable("trust proxy");

app.use(compression());
app.use(helmet());

//parse json request body.
app.use(express.json({ limit: "10kb" }));

app.use(cors());
app.options("*", cors());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());

/*remove this after implementing query parameters like amount date etc*/
app.use(hpp());

//middleware
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
//serve static files
app.use(express.static(path.join(__dirname, "public")));

//ROUTES
app.use("/", viewRouter);
app.use("/users", userRouter);
app.use("/transaction", transactionRouter);
// app.use("/", viewRouter);

app.use("*", (req, res, next) => {
    next(
        new AppError(`Could not find ${req.originalUrl} route on server!`, 404)
    );
});

app.use(errorHandler);

module.exports = app;
