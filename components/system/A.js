import { Link } from "../../routes";

export default ({ href, children, ...rest }) => {
  const a = <a {...rest}>{children}</a>;
  return href !== undefined ? (<Link route={href}>{a}</Link>) : a
};
