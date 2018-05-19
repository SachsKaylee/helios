import Link from "next/link";

export default ({ href, children, ...rest }) => {
  const a = <a {...rest}>{children}</a>;
  return href !== undefined ? (<Link href={href}>{a}</Link>) : a
};