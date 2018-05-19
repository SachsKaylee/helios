import A from "./A";

export default ({ title, logo, links }) => (
  <nav className="navbar">
    <div className="container">
      <div className="navbar-brand">
        <A className="navbar-item" href="../">
          <img className="logo-image" src={logo} alt="Logo" />
          {title}
        </A>
        <span className="navbar-burger burger" data-target="navbarMenu">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
      <div id="navbarMenu" className="navbar-menu">
        <div className="navbar-end">
          <Links links={links} />
        </div>
      </div>
    </div>
    <style jsx>
      {`.logo-image {
         margin-right: 6px;
      }`}
    </style>
  </nav>
)

const Links = ({ links }) => (links.map(l => (<SingleLink key={l.link} link={l.link} title={l.title}>{l.children}</SingleLink>)));
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