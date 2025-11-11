const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/scripts/index.js",
  output: {
    filename: "app.bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      // ✅ Khusus Leaflet CSS: cegah parsing ganda
      {
        test: /leaflet\.css$/i,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              esModule: false,
              url: false, // penting agar import url() di leaflet.css tidak bikin masalah
            },
          },
        ],
      },

      // ✅ CSS umum (styles.css kamu)
      {
        test: /\.css$/i,
        exclude: /leaflet\.css$/,
        use: ["style-loader", "css-loader"],
      },

      // ✅ Gambar (termasuk ikon Leaflet)
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      filename: "index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/public", to: path.resolve(__dirname, "dist") }],
    }),
  ],
};
