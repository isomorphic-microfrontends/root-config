const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env) => ({
  entry: path.resolve(__dirname, "browser/root-config"),
  output: {
    filename: "isomorphic-mf-root-config.js",
    libraryTarget: "system",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
  devServer: {
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  plugins: [new CleanWebpackPlugin()],
  externals: ["single-spa", /^@isomorphic-mf\/.+$/],
});
