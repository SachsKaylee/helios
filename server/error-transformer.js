const transformError = error => {
  if (!error) return "no-data";
  if (error.name === "MongoError") return transformMongoError(error);
  return error.message || error;
}

const transformMongoError = error => {
  switch (error.code) {
    case mongoError.duplicateKey: return "already-exists";
    default: return "mongo-" + error.code;
  }
}

const mongoError = {
  duplicateKey: 11000
}

module.exports = {
  mongoError,
  transformError
}