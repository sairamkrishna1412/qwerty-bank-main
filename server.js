const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = require("./app");

dotenv.config({ path: "./config.env" });

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
