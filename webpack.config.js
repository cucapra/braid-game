const path = require('path');

module.exports = {
  entry: './build/bug.js',
  output: {
    filename: 'example.bundle.js'
  },
  resolve: {
    alias: {
      "data": path.resolve(__dirname, "data"),
    }
  }
};
