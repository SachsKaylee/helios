import App, { Container } from "next/app";
import Head from "next/head";
import { get } from "axios";
import Navbar from "./../components/Navbar";
import config from "../config/client";
import { IntlProvider, addLocaleData, FormattedMessage } from "react-intl";
import flattenObject from "../utils/flattenObject"
import areIntlLocalesSupported from "intl-locales-supported";
import intl from "intl"; // todo: try to make this import lazy!
import Session, { SessionProvider } from "../store/Session";
import EmailIcon from "mdi-react/EmailIcon";
import AccountIcon from "mdi-react/AccountIcon";
import ViewDashboardIcon from "mdi-react/ViewDashboardIcon";
import BookOpenPageVariantIcon from "mdi-react/BookOpenPageVariantIcon";
import LogoutIcon from "mdi-react/LogoutIcon";
import NotificationStore, { NotificationProvider } from "../store/Notification";
import NotificationRenderer from "../components/NotificationRenderer";
import WebPush from "../components/WebPush";
import crossuser from "../utils/crossuser";
import * as sw from "next-offline/runtime";
import PWA from "../components/PWA";
import 'babel-polyfill';
import { permissions } from "../common/permissions";

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

export default class _App extends App {
  static async getInitialProps({ Component, ctx, req }) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};
    const customPages = await get("/api/page-navigation", crossuser(req));
    return { pageProps, customPages: customPages.data };
  }

  constructor(p) {
    super(p);
    this.setPageTitle = this.setPageTitle.bind(this);
    this.state = {
      title: ""
    };
  }

  componentDidMount() {
    sw.register();
  }

  setPageTitle(title) {
    this.setState({ title });
  }

  render() {
    const { Component, pageProps, customPages } = this.props;
    //const title = this.component && this.component.getTitle && this.component.getTitle() || "…";
    const title = this.state.title;
    return (<Container>
      <IntlProvider
        locale={localeMeta.id}
        messages={flattenObject(localeMessages)}>
        <SessionProvider>
          <NotificationProvider>
            <WebPush />
            <PWA />
            <Head>
              <title key="title">{title && title + " | "}{config.title}</title>
            </Head>
            <Session>
              {session => (
                <Navbar
                  title={(<span>{config.title}{title && " - " + title}</span>)}
                  logo="/static/content/system/logo.png">
                  {[
                    {
                      title: (<FormattedMessage id="navigation.home" />),
                      link: "/",
                      _id: "home"
                    },
                    ...customPages,
                    session.user && {
                      title: (<span><FormattedMessage id="navigation.admin.menu" />{session.user ? (": " + session.user.id) : null}</span>),
                      link: "/admin",
                      _id: "admin",
                      children: [
                        session.hasPermission(permissions.post) && {
                          icon: EmailIcon,
                          title: (<FormattedMessage id="navigation.admin.newPost" />),
                          link: "/admin/post",
                          _id: "post"
                        },
                        session.hasPermission(permissions.page) && {
                          icon: BookOpenPageVariantIcon,
                          title: (<FormattedMessage id="navigation.admin.newPage" />),
                          link: "/admin/page",
                          _id: "page"
                        },
                        {
                          icon: ViewDashboardIcon,
                          title: (<FormattedMessage id="navigation.admin.overview" />),
                          link: "/admin",
                          _id: "overview"
                        },
                        {
                          icon: AccountIcon,
                          title: (<FormattedMessage id="navigation.admin.account" />),
                          link: "/admin/account",
                          _id: "account"
                        },
                        {
                          icon: LogoutIcon,
                          title: (<FormattedMessage id="navigation.admin.signOut" />),
                          link: "/admin/account",
                          onClick: session.signOut,
                          _id: "signOut"
                        }
                      ]
                    },
                    (!session.user && !config.hideLogInButton) && {
                      title: (<FormattedMessage id="navigation.admin.signIn" />),
                      link: "/admin/account",
                      _id: "signIn"
                    }]}
                </Navbar>)}
            </Session>
            <div className="section">
              <Component {...pageProps} setPageTitle={this.setPageTitle} />
            </div>
            <footer className="footer">
              <div className="content has-text-centered">
                <p><a href={`https://${config.domains[0]}:${config.port.https}`}><strong>{config.title}</strong></a> - {config.description}</p>
                {config.branding ? (<p className="is-size-7"><a href="https://github.com/PatrickSachs/helios"><FormattedMessage id="branding" /></a></p>) : null}
              </div>
            </footer>
            <div id="overlay">
              <NotificationStore>
                {({ notifications, close }) => (<NotificationRenderer notifications={notifications} onClose={close} />)}
              </NotificationStore>
            </div>
          </NotificationProvider>
        </SessionProvider>
      </IntlProvider>
    </Container>);
  }
}