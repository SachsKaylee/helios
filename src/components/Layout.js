import Head from "next/head";
import Navbar from "./Navbar";
import config from "../config/client";
import textContent from "react-addons-text-content";
import { IntlProvider, addLocaleData, FormattedMessage } from "react-intl";
import { flattenObject } from "../fp"
import areIntlLocalesSupported from "intl-locales-supported";
import intl from "intl"; // todo: try to make this import lazy!

const g = global || window;
// Load the locale data for NodeJS if it has not been installed.
if (g.Intl && !areIntlLocalesSupported([config.locale.meta.id])) {
  console.log("📡", "Polyfilling locale for client", config.locale.meta.id);
  Intl.NumberFormat = intl.NumberFormat;
  Intl.DateTimeFormat = intl.DateTimeFormat;
} else if (!g.Intl) {
  console.log("📡", "Polyfilling Intl for client");
  g.Intl = intl;
}
addLocaleData(config.locale.meta.intl);

const {
  meta: localeMeta,
  ...localeMessages
} = config.locale;


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
    return (
      <IntlProvider
        locale={localeMeta.id}
        messages={flattenObject(localeMessages)}>
        <>
          <Head>
            <title key="title">{textContent(title)} | {config.title}</title>
          </Head>
          <Navbar
            title={(<span>{config.title} - {title}</span>)}
            logo="/static/content/system/logo.png"
            links={[{
              title: (<FormattedMessage id="navigation.home" />),
              link: "/"
            }, {
              title: (<FormattedMessage id="navigation.admin.menu" />),
              link: "/admin",
              children: [{
                title: (<FormattedMessage id="navigation.admin.newPost" />),
                link: "/admin/post"
              }, {
                title: (<FormattedMessage id="navigation.admin.account" />),
                link: "/admin/account"
              }]
            }]} />
          <div className="section">
            <div className="container">
              {children}
            </div>
          </div>
        </>
      </IntlProvider>);
  }
};