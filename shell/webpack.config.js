require("dotenv").config();

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

const HEADER_URL = process.env.HEADER_URL || "http://localhost:3001";
const BANNER_URL = process.env.BANNER_URL || "http://localhost:3002";

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    publicPath: "auto",
  },
  devServer: {
    port: 3000,
    hot: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        header: `header@${HEADER_URL}/remoteEntry.js`,
        banner: `banner@${BANNER_URL}/remoteEntry.js`,
      },
      shared: {
        vue: { singleton: true, requiredVersion: "^3.5.0" },
        react: { singleton: true, requiredVersion: "^18.3.1" },
        "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
