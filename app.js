const path = require("path");
const express = require("express");
const morgan = require("morgan");

const userRouter = require("./routes/userRoutes");
const errorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();

//middleware
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
//serve static files
app.use(express.static(path.join(__dirname, "public")));

//parse json request body.
app.use(express.json({ limit: "10kb" }));

//ROUTES
// app.use("/", viewRouter);
app.use("/users", userRouter);

app.use("*", (req, res, next) => {
    next(
        new AppError(`Could not find ${req.originalUrl} route on server!`, 404)
    );
});

app.use(errorHandler);

module.exports = app;
