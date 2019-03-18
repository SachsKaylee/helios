import React from "react";
import SetupLanguageForm from "../../components/forms/setup/SetupLanguageForm";
import { put, get, post } from "axios";
import { FormattedMessage, injectIntl } from "react-intl";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import { Router } from "../../common/routes";

export default withStores(NotificationStore, injectIntl(class SetupPage extends React.PureComponent {
  static async getInitialProps(ctx) {
    try {
      const userCount = await get("/api/user-count");
      if (userCount.data.count !== 0) {
        if (ctx.res) {
          ctx.res.writeHead(302, {
            Location: '/setup/settings'
          })
          ctx.res.end()
        } else {
          Router.push('/setup/settings')
        }
      }
      return {};
    } catch (error) {
      console.error("Failed to load user count", error);
      return {};
    }
  }

  constructor(p) {
    super(p);
    this.onSave = this.onSave.bind(this);
    this.state = {
      origConfig: p.config
    }
  }

  componentDidMount() {
    this.props.setPageTitle(this.props.intl.formatMessage({ id: "system.setup.welcome.title" }));
  }

  render() {
    return ([
      this.renderWelcome(),
      this.renderChooseLanguageAndAdmin(),
      this.renderAlreadySetupWarning(),
    ]);
  }

  async onSave({ name, password, ...values }) {
    try {
      if (name && password) {
        await post("/api/user", { initialUser: true, id: name, password: password, permissions: ["admin"], bio: "", avatar: "" });
      }
      await put("/api/system/config/system", values);
      // Navigate normally to force SSR refresh.
      window.location.href = "/setup/settings";
    } catch (error) {
      this.props.notificationStore.pushError(error);
    }
  }

  renderAlreadySetupWarning() {
    return (<div className="notification is-warning" key="already-set-up" style={{ marginTop: 16 }}>
      <p><FormattedMessage id="system.setup.alreadyInstalled.warning" /></p>
      <pre>
        {JSON.stringify(this.props.config, null, 2)}
      </pre>
      <p><FormattedMessage id="system.setup.alreadyInstalled.effect" /></p>
    </div>);
  }

  renderWelcome() {
    return (<section className="hero is-primary" key="welcome">
      <div className="hero-body">
        <div className="container">
          <h1 className="title"><FormattedMessage id="system.setup.welcome.title" /></h1>
          <h2 className="subtitle"><FormattedMessage id="system.setup.welcome.slug" /></h2>
        </div>
      </div>
    </section>);
  }

  renderChooseLanguageAndAdmin() {
    return (<div className="card" key="form">
      <div className="card-content">
        <div className="content">
          <p><FormattedMessage id="system.setup.welcome.text" /></p>
          <div>
            <SetupLanguageForm data={this.props.config || {}} onSubmit={this.onSave} />
          </div>
        </div>
      </div>
    </div>)
  }
}));