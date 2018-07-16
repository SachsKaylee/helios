const formatBytes = bytes => {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (Math.ceil(bytes / 1024)) + "KiB";
  if (bytes < 1024 * 1024 * 1024) return (Math.ceil(bytes / (1024 * 1024))) + "MiB";
  return (Math.ceil(bytes / (1024 * 1024 * 1024))) + "GiB";
}

export {
  formatBytes
};