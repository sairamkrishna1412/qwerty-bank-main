const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.error(err.stack);
    console.log("UNCAUGHT EXCEPTION, SHUTTING DOWN SERVER...");
    process.exit(1);
});
//this must be before we require app. only then morgan will be able to log
dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log("DB connection established!"));

const port = process.env.PORT || 8000;

const server = app.listen(port, function () {
    console.log(`Listening to requests at ${port}`);
});

process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.error(err.stack);
    console.log("UNHANDLED REJECTION!, SHUTTING DOWN SERVER...");
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log(
        "SIGTERM triggered. shutting down application after executing all pending requests."
    );
    server.close(() => {
        console.log("Process terminated. all pending requests executed");
    });
});
