const pathNormalize = path => {
  const sections = path.split("/");
  const builder = sections.reduce((builder, section) => {
    switch (section) {
      case "": {
        break;
      }
      case ".": {
        break;
      }
      case "..": {
        builder.pop();
        break;
      }
      default: {
        builder.push(section);
        break;
      }
    }
    return builder;
  }, []);
  return builder;
};