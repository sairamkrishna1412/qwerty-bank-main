const path = require("path");
// const BundleAnalyzerPlugin =
//     require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    entry: "./public/js/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(`${__dirname}/public`, "js"),
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }],
                        ],
                    },
                },
            },
        ],
    },
    // plugins: [new BundleAnalyzerPlugin()],
    devServer: {
        contentBase: path.join(__dirname, "public"),
        port: process.env.PORT,
    },
};

// {
//     test: /\.css$/i,
//     use: ["style-loader", "css-loader"],
// },
// {
//     test: /\.(png|svg|jpg|jpeg|gif)$/i,
//     type: "asset/resource",
// },
