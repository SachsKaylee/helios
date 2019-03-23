const fs = require('fs');
const path = require('path');

/**
 * I copied (and modified it a bit) the file into this repo to avoid adding many 
 * small libraries which sadly poses a security threat nowadays.
 * https://github.com/fs-utils/fs-readdir-recursive/blob/master/index.js
 */
function readdirRecursive(root, filter, files, prefix) {
  prefix = prefix || "";
  files = files || [];
  filter = filter || noDotFiles;

  const dir = path.join(root, prefix)
  if (!fs.existsSync(dir)) {
    return files;
  }
  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir)
      .filter((name, index) => filter(name, index, dir))
      .forEach((name) => readdirRecursive(root, filter, files, path.join(prefix, name)));
  } else {
    files.push(prefix);
  }

  return files;
}

function noDotFiles(x) {
  return x[0] !== '.';
}

module.exports = readdirRecursive;