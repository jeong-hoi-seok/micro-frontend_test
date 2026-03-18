require("dotenv").config();

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// 프로덕션에서는 같은 도메인의 하위 경로로 remote를 가져옴
const HEADER_URL = process.env.HEADER_URL || (isProduction ? "/header" : "http://localhost:3001");
const BANNER_URL = process.env.BANNER_URL || (isProduction ? "/banner" : "http://localhost:3002");

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: true,
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
