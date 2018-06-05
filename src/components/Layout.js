import Head from "next/head";
import Navbar from "./Navbar";
import config from "../config/client";

export default class Layout extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      session: undefined
    };
  }

  render() {
    const { title, children } = this.props;
    const { store } = this.state;
    return (<>
      <Head>
        <title key="title">{title} | {config.title}</title>
      </Head>
      <Navbar
        title={config.title + " - " + title}
        logo="/static/content/system/logo.png"
        links={[{
          title: "Home",
          link: "/"
        }, {
          title: "Projects",
          link: "/projects"
        }, {
          title: "Admin",
          link: "/admin",
          children: [{
            title: "New Post",
            link: "/admin/post"
          }, {
            title: "Account",
            link: "/admin/account"
          }]
        }]} />
      <div className="section">
        <div className="container">
          {children}
        </div>
      </div>
    </>);
  }
};