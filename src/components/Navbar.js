import A from "./A";
import classnames from "classnames";
import React from "react";

export default class extends React.Component {
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
    const { logo, title, links } = this.props;
    const { active } = this.state;
    return (<nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <A className="navbar-item" href="../">
            <img src={logo} alt="Logo" />
            &nbsp;
            {title}
          </A>
          <span className={classnames("navbar-burger", "burger", active && "is-active")} onClick={this.toggleActive} aria-label="menu" aria-expanded={active}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <div className={classnames("navbar-menu", active && "is-active")}>
          <div className="navbar-end">
            <Links links={links} />
          </div>
        </div>
      </div>
    </nav>);
  }
};

const Links = ({ links }) => (links.map(l => l && (<SingleLink key={l.link} link={l.link} title={l.title}>{l.children}</SingleLink>)));
const SingleLink = ({ title, link, children }) => (
  children
    ? (<div className="navbar-item has-dropdown is-hoverable">
      <a className="navbar-link">{title}</a>
      <div className="navbar-dropdown">
        <Links links={children} />
      </div>
    </div>)
    : (<A href={link} className="navbar-item">{title}</A>)
);