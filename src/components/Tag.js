import classNames from "classnames";

export default ({type, children}) => (<span className={classNames("tag", type && "is-" + type)}>{children}</span>);