const path = require("path");  // Menambahkan impor path
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map", // Memungkinkan debugging dengan source map

  devServer: {
    static: path.resolve(__dirname, "dist"), // Menyajikan file dari dist folder
    port: 9000, // Port default untuk dev server
    open: true, // Membuka browser otomatis
    hot: true, // Hot module replacement (HMR)
    client: {
      overlay: {
        errors: true, // Menampilkan error di browser
        warnings: true, // Menampilkan warning di browser
      },
    },
  },
});
