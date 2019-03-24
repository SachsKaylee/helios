import App, { Container } from "next/app";
import Head from "next/head";
import { get } from "axios";
import Navbar from "./../components/Navbar";
import { IntlProvider, FormattedMessage, addLocaleData } from "react-intl";
import flattenObject from "../utils/flattenObject";
import isClient from "../utils/is-client";
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
/*
import DETEST from "react-intl/locale-data/de"
addLocaleData(DETEST)
*/

export default class _App extends App {
  static async getInitialProps({ Component, ctx, req }) {
    const config = ctx.req ? await ctx.req.system.config() : window.__HELIOS_CONFIG__;
    const locale = ctx.req ? await ctx.req.system.locale() : window.__HELIOS_LOCALE__;
    ctx.config = config;
    ctx.locale = locale;
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};
    let customPages;
    try {
      const navRequest = await get("/api/page-navigation", crossuser(req));
      customPages = navRequest.data;
    } catch (error) {
      console.error("Failed to load navigation", error.message);
      customPages = [];
    }
    return { pageProps, customPages: customPages, config, locale };
  }

  constructor(p) {
    super(p);
    this.setPageTitle = this.setPageTitle.bind(this);
    this.state = {
      title: "",
      config: this.props.config,
      locale: this.props.locale,
      messages: flattenObject(this.props.locale)
    };
    if (isClient()) {
      // TODO: Lazy load, investigate if actually nedded, etc...
      // Load the locale data for NodeJS if it has not been installed.
      if (window.Intl && !areIntlLocalesSupported([this.state.locale.meta.id])) {
        console.log("📡", "Polyfilling locale for client", this.state.locale.meta.id);
        Intl.NumberFormat = intl.NumberFormat;
        Intl.DateTimeFormat = intl.DateTimeFormat;
      } else if (!window.Intl) {
        console.log("📡", "Polyfilling Intl for client");
        window.Intl = intl;
      }
      addLocaleData(ReactIntlLocaleData[this.state.locale.meta.id]);
    }
  }

  componentDidMount() {
    sw.register();
  }

  setPageTitle(title) {
    this.setState({ title });
  }

  render() {
    const { Component, pageProps, customPages, locale } = this.props;
    const { config, messages } = this.state;
    //const title = this.component && this.component.getTitle && this.component.getTitle() || "…";
    const title = this.state.title;
    return (<Container>
      <IntlProvider
        locale={locale.meta.id}
        messages={messages}>
        <SessionProvider>
          <NotificationProvider>
            <WebPush promptForNotificationsAfter={this.state.config.promptForNotificationsAfter} />
            <PWA promptForAddToHomeScreenAfter={this.state.config.promptForAddToHomeScreenAfter} />
            <Head>
              <title key="title">{title && title + " | "}{config ? config.title : "Helios"}</title>
            </Head>
            <Session>
              {session => (
                <Navbar
                  title={(<span>{config && config.title}{title && " - " + title}</span>)}
                  logo={config.logo.full}>
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
                    (!session.user && config && !config.hideLogInButton) && {
                      title: (<FormattedMessage id="navigation.admin.signIn" />),
                      link: "/admin/account",
                      _id: "signIn"
                    }]}
                </Navbar>)}
            </Session>
            <div className="section">
              <Component {...pageProps} setPageTitle={this.setPageTitle} config={this.state.config} />
            </div>
            <footer className="footer">
              <div className="content has-text-centered">
                <p><a href={`//`}><strong>{config ? config.title : "Helios"}</strong></a> - {config && config.description}</p>
                {!config || config.branding ? (<p className="is-size-7"><a href="https://github.com/PatrickSachs/helios"><FormattedMessage id="branding" /></a></p>) : null}
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