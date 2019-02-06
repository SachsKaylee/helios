import React from "react";
import SetupLanguageForm from "../../components/forms/setup/SetupLanguageForm";
import { put } from "axios";
import { FormattedMessage, injectIntl } from "react-intl";

export default injectIntl(class SetupPage extends React.PureComponent {
  static async getInitialProps(ctx) {
  }

  constructor(p) {
    super(p);
    this.onChangeLocale = this.onSave.bind(this);
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
      this.renderChooseLanguage(),
      this.renderAlreadySetupWarning(),
    ]);
  }

  onSave(values) {
    put("/api/system/config/system", values).then(() => {
      // Navigate normally to force SSR refresh.
      window.location.href = "/setup/basic";
    })
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

  renderChooseLanguage() {
    return (<div className="card" key="language">
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
});