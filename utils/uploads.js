const fs = require("fs");
const path = require("path");

module.exports.uploadFiles = async (files, product) => {
  try {
    const images = [];
    let fileIndex = 0;
    for (let file of files) {
      // Create the directory if it doesn't exist
      const dir = `public/uploads/${product.category}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Define the old path and the new path
      const oldPath = file.path;
      const fileExt = file.originalname.split(".").pop();
      const newFileName = `${product._id}_${fileIndex}.${fileExt}`;
      const newPath = path.join(dir, newFileName);

      // Move the file
      fs.rename(oldPath, newPath, (err) => {
        if (err) throw err;
      });

      fileIndex++;
      images.push(newFileName);
    }
    return images;
  } catch (error) {
    console.error(error);
  }
};
