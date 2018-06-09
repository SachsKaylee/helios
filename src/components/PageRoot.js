import Head from "next/head";
import Navbar from "./Navbar";
import config from "../config/client";
import textContent from "react-addons-text-content";
import { IntlProvider, addLocaleData, FormattedMessage } from "react-intl";
import { flattenObject } from "../fp"
import areIntlLocalesSupported from "intl-locales-supported";
import intl from "intl"; // todo: try to make this import lazy!
import Store from "../store";
import { get, post, put } from "axios";

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


export default class PageRoot extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      session: undefined
    };
  }

  componentDidMount() {
    get("/api/session")
      .then(({ data }) => this.setState({ session: data }))
      .catch(() => this.setState({ session: undefined }));
  }

  signIn = ({ id, password }) => new Promise((res, rej) =>
    post("/api/session/login", { id, password })
      .then(({ data }) => this.setState({ session: data }, res))
      .catch(error => rej(error.response.data)));

  signOut = () => new Promise((res, rej) =>
    post("/api/session/logout")
      .then(() => this.setState({ session: undefined }, res))
      .catch(error => rej(error.response.data)));

  updateProfile = ({ password, passwordNew, avatar, bio }) => new Promise((res, rej) =>
    put("/api/session", { password, passwordNew, avatar, bio })
      .then(({ data }) => this.setState({ session: data }, res))
      .catch(error => rej(error.response.data)));

  setSession = (session) => {
    this.setState({ session });
  }

  hasPermission = (perm) => {
    const { session } = this.state;
    return session && (
      session.permissions.indexOf("admin") !== -1 ||
      session.permissions.indexOf(perm) !== -1)
  }

  actions = {
    setSession: this.setSession,
    signIn: this.signIn,
    signOut: this.signOut,
    updateProfile: this.updateProfile
  }

  render() {
    const { title, children } = this.props;
    const { session } = this.state;
    return (
      <IntlProvider
        locale={localeMeta.id}
        messages={flattenObject(localeMessages)}>
        <Store.Provider value={{
          session,
          hasPermission: this.hasPermission,
          actions: this.actions
        }}>
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
              children: [
                this.hasPermission("author") && {
                  title: (<FormattedMessage id="navigation.admin.newPost" />),
                  link: "/admin/post"
                },
                {
                  title: (<FormattedMessage id="navigation.admin.account" />),
                  link: "/admin/account"
                }
              ]
            }]} />
          <div className="section">
            <div className="container">
              {children}
            </div>
          </div>
        </Store.Provider>
      </IntlProvider>);
  }
};