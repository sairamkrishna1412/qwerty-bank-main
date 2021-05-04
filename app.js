const path = require("path");
const express = require("express");
const morgan = require("morgan");

const userRouter = require("./routes/userRoutes");

const app = express();

//middleware
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

module.exports = app;
