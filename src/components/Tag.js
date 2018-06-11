import classNames from "classnames";

const Tag = ({type, children}) => (<span className={classNames("tag", type && "is-" + type)}>{children}</span>);
export default Tag;