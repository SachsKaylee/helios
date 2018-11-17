import A from "./system/A";
import classnames from "classnames";
import React from "react";

export default class Navbar extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      active: false
    }
  }

  toggleActive = () => {
    this.setState(({ active }) => ({ active: !active }));
  }

  render() {
    const { logo, title, children } = this.props;
    const { active } = this.state;
    return (<nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <A className="navbar-item" href="../">
            <img src={logo} alt="Logo" />
            &nbsp;
            <h1>{title}</h1>
          </A>
          <span className={classnames("navbar-burger", "burger", active && "is-active")} onClick={this.toggleActive} aria-label="menu" aria-expanded={active}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <div className={classnames("navbar-menu", active && "is-active")}>
          <div className="navbar-end">
            <Links>{children}</Links>
          </div>
        </div>
      </div>
    </nav>);
  }
};

const Links = ({ children }) => (children.map(child => child && (<SingleLink key={child.key} {...child}>{child.children}</SingleLink>)));
const SingleLink = ({ title, link, children, ...rest }) => (
  children
    ? (<div className="navbar-item has-dropdown is-hoverable">
      <a className="navbar-link">{title}</a>
      <div className="navbar-dropdown">
        <Links {...rest}>{children}</Links>
      </div>
    </div>)
    : (<A href={link} className="navbar-item" {...rest}>{title}</A>)
);
