const uuidSection = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

const uuid = () => uuidSection() + uuidSection() + '-' + uuidSection() + '-' + uuidSection() + '-' + uuidSection() + '-' + uuidSection() + uuidSection() + uuidSection();

module.exports = {
  uuid, uuidSection
}
