const uuid = require("./uuid");

/**
 * Creates a nice unique URI out of a given text. This strips all non alphanumeric characters.
 * @param {string?} text The text. If no text is given a short random uuid will be used.
 * @return {string} The URI.
 */
const niceUri = (text, theUuid = uuid.uuidSection()) =>
  (("" + (text || uuid.uuidSection())) // Make sure we have a string! If not just shove a UUID in there.
    .replace(/[^a-zA-Z0-9]/g, '-')     // Replace non alphanumerical things with "-"
    .toLowerCase()                     // the internet is lowercase
    + "-" + theUuid)                      // Append a UUID to it, in case someone writes two posts with the same title
    .replace(/-+/g, "-");              // Avoid having URIs with multiple "-"s after another

module.exports = niceUri;
