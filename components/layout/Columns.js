import classNames from "classnames";

export default ({ size, children, sidebar }) => (
  <div className="columns">
    <div style={{paddingRight: 0}} className={classNames("column", "is-" + (12 - size))}>{children}</div>
    <div style={{paddingRight: 0}} className={classNames("column", "is-" + size)}>{sidebar}</div>
  </div>
);
