import React from "react";
import { put, post, get } from "axios";
import { FormattedMessage, injectIntl } from "react-intl";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import { uuid } from "../../utils/uuid";
import * as timeout from "../../utils/timeout";
import CakeIcon from "mdi-react/CakeIcon";
import PublishIcon from "mdi-react/PublishIcon";
import FileDiscardIcon from "mdi-react/FileDiscardIcon";
import EditorCode from "../../components/EditorCode";

export default withStores(NotificationStore, injectIntl(class JsonSettingsPage extends React.PureComponent {
  static async getInitialProps(ctx) {
  }

  constructor(p) {
    super(p);
    this.onSave = this.onSave.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDiscard = this.onDiscard.bind(this);
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
      this.renderSettings()
    ]);
  }

  onDiscard() {
    this.setState({ config: this.props.config });
  }

  onChange(value) {
    let json;
    try {
      json = JSON.parse(value);
    } catch (e) {
      json = this.state.config;
    }
    this.setState({ config: json });
  }

  async onSave(values) {
    const id = "restart/" + uuid();
    try {
      const newConfig = await put("/api/system/config/system", values);
      this.props.notificationStore.push({
        _id: id + "/wait",
        icon: CakeIcon,
        type: "info",
        title: (<FormattedMessage id="system.setup.basic.restart.wait.title" />),
        children: (<FormattedMessage id="system.setup.basic.restart.wait.description" />)
      });
      await this.setStateAsync({ config: newConfig.data });
      await this.restartServer();
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
        ? `http://${config.domains[0]}:${config.ports.http}/setup/json`
        : `https://${config.domains[0]}:${config.ports.https}/setup/json`;
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

  async restartServer() {
    const { data: oldServerId } = await get("/api/system/ping");
    await post("/api/system/restart");
    return await this.waitOnline(30, oldServerId);
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
        console.log("... Server did restart! Resolving promise in two seconds.", { data, id, n });
        return data;
      } else {
        console.log("... Waiting for server restart.", { data, id, n });
      }
    } catch (error) {
      console.log("... Waiting for server restart.", { error, n });
    }
    await timeout.pass(1000);
    return await this.waitOnline(n - 1, id);
  }

  onBack() {
    window.location.href = "/setup";
  }

  renderWelcome() {
    return (<section className="hero is-warning" key="welcome">
      <div className="hero-body">
        <div className="container">
          <h1 className="title"><FormattedMessage id="system.setup.json.title" /></h1>
          <h2 className="subtitle"><FormattedMessage id="system.setup.json.slug" /></h2>
        </div>
      </div>
    </section>);
  }

  renderSettings() {
    const { _id, __v, ...config } = this.state.config;
    return ([(<div key="json" style={{ height: 350 }}>
      <EditorCode mode="json" value={JSON.stringify(config, null, 2)} onChange={this.onChange} />
    </div>),
    (<div className="card" key="buttons">
      <div className="card-content">
        <div className="content">
          <p><FormattedMessage id="system.setup.json.warning" /></p>
          <p className="buttons">
            <a className="button is-primary" onClick={this.onSave}>
              <PublishIcon className="mdi-icon-spacer" /> <FormattedMessage id="system.setup.json.saveAndRestart" />
            </a>
            <a className="button is-danger" onClick={this.onDiscard}>
              <FileDiscardIcon className="mdi-icon-spacer" /> <FormattedMessage id="discard" />
            </a>
          </p>
        </div>
      </div>
    </div>)])
  }
}));
