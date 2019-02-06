import React from "react";
import SetupBasicForm from "../../components/forms/setup/SetupBasicForm";
import { put, post, get } from "axios";
import { FormattedMessage, injectIntl } from "react-intl";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import { uuid } from "../../utils/uuid";
import * as timeout from "../../utils/timeout";
import CakeIcon from "mdi-react/CakeIcon";

export default withStores(NotificationStore, injectIntl(class SetupSettingsPage extends React.PureComponent {
  static async getInitialProps(ctx) {
  }

  constructor(p) {
    super(p);
    this.onBack = this.onBack.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {
      config: p.config
    }
  }

  setStateAsync(data) {
    return new Promise(resolve => this.setState(data, resolve));
  }

  componentDidMount() {
    this.props.setPageTitle(this.props.intl.formatMessage({ id: "system.setup.basic.title" }));
  }

  render() {
    return ([
      this.renderWelcome(),
      this.renderSettings(),
      this.renderAlreadySetupWarning(),
    ]);
  }

  async onSave(values) {
    const id = "restart/" + uuid();
    try {
      const { data } = await put("/api/system/config/system", values);
      this.props.notificationStore.push({
        _id: id + "/wait",
        icon: CakeIcon,
        type: "info",
        title: (<FormattedMessage id="system.setup.basic.restart.wait.title" />),
        children: (<FormattedMessage id="system.setup.basic.restart.wait.description" />)
      });
      await this.setStateAsync({ config: data });
      const { data: oldServerId } = await get("/api/system/ping");
      console.log("got old ping id", { oldServerId })
      await post("/api/system/restart");
      const newId = await this.waitOnline(10, oldServerId);
      console.log("back online", {newId})
      this.props.notificationStore.close(id + "/wait");
      this.props.notificationStore.push({
        _id: id + "/done",
        icon: CakeIcon,
        type: "success",
        title: (<FormattedMessage id="system.setup.basic.restart.done.title" />),
        children: (<FormattedMessage id="system.setup.basic.restart.done.description" />)
      });
      const { config } = this.state;
      const url = config.ssl === "none"
        ? `http://${config.domains[0]}:${config.ports.http}/`
        : `https://${config.domains[0]}:${config.ports.https}/`;
        console.log("url", {url})
      // Navigate normally to force SSR refresh.
      window.location.href = url;
    } catch (error) {
      console.error("Failed to apply config", error);
      this.props.notificationStore.close(id + "/wait");
      this.props.notificationStore.push({
        _id: id + "/error",
        icon: CakeIcon,
        type: "danger",
        title: (<FormattedMessage id="system.setup.basic.restart.error.title" />),
        children: (<FormattedMessage id="system.setup.basic.restart.error.description" />)
      });
    }
  }

  async waitOnline(n, id) {
    if (n === 0) {
      throw new Error("Maximum check count exceeded");
    }
    const { config } = this.state;
    const promise = config.ssl === "none"
      ? get(`http://${config.domains[0]}:${config.ports.http}/api/system/ping`)
      : get(`https://${config.domains[0]}:${config.ports.https}/api/system/ping`);
    try {
      const { data } = await promise;
      if (data !== id) {
        return data;
      } else {
        console.warn("Invalid ping result", { data, id });
      }
    } catch (error) {
      console.warn("Invalid ping result", { error });
    }
    await timeout.pass(1000);
    return await this.waitOnline(n - 1);
  }

  onBack() {
    window.location.href = "/setup";
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
          <h1 className="title"><FormattedMessage id="system.setup.basic.title" /></h1>
          <h2 className="subtitle"><FormattedMessage id="system.setup.basic.slug" /></h2>
        </div>
      </div>
    </section>);
  }

  renderSettings() {
    return (<div className="card" key="language">
      <div className="card-content">
        <div className="content">
          <p><FormattedMessage id="system.setup.basic.text" /></p>
          <div>
            <SetupBasicForm data={this.props.config} onBack={this.onBack} onSubmit={this.onSave} />
          </div>
        </div>
      </div>
    </div>)
  }
}));
