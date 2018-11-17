const uuid = require("./uuid");

const niceUri = text =>
  (("" + (text || uuid.uuidSection())) // Make sure we have a string! If not just shove a UUID in there.
    .replace(/[^a-zA-Z0-9]/g, '-')     // Replace non alphanumerical things with "-"
    .toLowerCase()                     // the internet is lowercase
    + "-" + uuid.uuidSection())        // Append a UUID to it, in case someone writes two posts with the same title
    .replace(/-+/g, "-");              // Avoid having URIs with multiple "-"s after another

module.exports = niceUri;
