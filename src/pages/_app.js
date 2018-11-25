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
import BookOpenPageVariantIcon from "mdi-react/BookOpenPageVariantIcon";
import NotificationStore, { NotificationProvider } from "../store/Notification";
import NotificationRenderer from "../components/NotificationRenderer"

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
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};
    const customPages = await get("/api/page-navigation");
    return { pageProps, customPages: customPages.data };
  }

  constructor(p) {
    super(p);
    this.setPageTitle = this.setPageTitle.bind(this);
    this.state = {
      title: "…"
    };
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
            <Head>
              <title key="title">{title} | {config.title}</title>
            </Head>
            <Session>
              {session => (
                <Navbar
                  title={(<span>{config.title} - {title}</span>)}
                  logo="/static/content/system/logo.png">
                  {[
                    {
                      title: (<FormattedMessage id="navigation.home" />),
                      link: "/",
                      _id: "home"
                    },
                    ...customPages,
                    session.user && {
                      title: (<FormattedMessage id="navigation.admin.menu" />),
                      link: "/admin",
                      _id: "admin",
                      children: [
                        session.hasPermission("author") && {
                          title: (<FormattedMessage id="navigation.admin.newPost" />),
                          link: "/admin/post",
                          _id: "post"
                        },
                        session.hasPermission("maintainer") && {
                          title: (<span>
                            <BookOpenPageVariantIcon className="mdi-icon-spacer" />
                            <FormattedMessage id="navigation.admin.newPage" />
                          </span>),
                          link: "/admin/page",
                          _id: "page"
                        },
                        session.hasPermission("admin") && {
                          title: (<FormattedMessage id="navigation.admin.overview" />),
                          link: "/admin",
                          _id: "overview"
                        },
                        {
                          title: (<FormattedMessage id="navigation.admin.account" />),
                          link: "/admin/account",
                          _id: "account"
                        },
                        {
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