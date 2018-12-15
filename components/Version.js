/**
 * Renders a version number.
 * @param {{ family: string | number, major: string | number, minor: string | number, patch: string | number, detailed?: boolean }} props 
 */
const Version = ({ family, major, minor, patch, detailed = true }) => {
  return (<span>
    {family}
    &nbsp;
    {detailed
      ? (<span className="is-size-7">{major}.{minor}.{patch}</span>)
      : (<span className="is-size-7">{major}</span>)}
  </span>)
};

export default Version;
