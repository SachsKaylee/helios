import classNames from "classnames";

export default ({ size, children, sidebar }) => (
  <div className="columns">
    <div className={classNames("column", "is-" + (12 - size))}>{children}</div>
    <div className={classNames("column", "is-" + size)}>{sidebar}</div>
  </div>
);