import Head from "next/head";
import Navbar from "./Navbar";

export default (({ title, children }) => (
  <div>
    <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      <title key="title">{title} | Patrick Sachs</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css" />
      <script defer src="https://use.fontawesome.com/releases/v5.0.7/js/all.js"></script>
    </Head>
    <Navbar
      title={"Patrick Sachs - " + title}
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
    <div className="container">
      {children}
    </div>
    <style jsx>
      {`html, body {
        font-family: 'Open Sans', sans-serif;
        font-size: 14px;
        background: #F0F2F4;
      }`}
    </style>
  </div>
));