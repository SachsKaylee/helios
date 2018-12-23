/**
 * Extracts data from a blob.
 * @param {string} blob The blob
 * @returns {{data: string, mime: string, format: string}} The data.
 */
const blobExtract = blob => {
  const [details, data] = blob.split(",");
  const [mime, format] = details.split(";");
  return { mime: mime.substr("data:".length), format, data };
};

module.exports = blobExtract
