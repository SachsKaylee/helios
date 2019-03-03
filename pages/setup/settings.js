import React from "react";
import SettingsForm from "../../components/forms/setup/SettingsForm";
import { put } from "axios";
import { FormattedMessage, injectIntl } from "react-intl";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import CakeIcon from "mdi-react/CakeIcon";
import Card from "../../components/layout/Card";
import EditorCode from "../../components/EditorCode";
import deepEqual from "deep-equal";

export default withStores(NotificationStore, injectIntl(class SetupSettingsPage extends React.PureComponent {
  static async getInitialProps(ctx) {
  }

  constructor(p) {
    super(p);
    this.onSave = this.onSave.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeJson = this.onChangeJson.bind(this);
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

  onChange({ _id, __v, ...values }) {
    const { _id: _oldId, __v: __oldV, ...old } = this.state.config;
    if (!deepEqual(values, old)) {
      this.setState({ config: values });
    }
  }

  onChangeJson(json) {
    let parsed = undefined;
    try {
      parsed = JSON.parse(json);
    } catch (error) {

    }
    if (parsed !== undefined) {
      this.onChange(parsed);
    }
  }

  async onSave(values) {
    const { data } = await put("/api/system/config/system", values);
    await this.setStateAsync({ config: data });
    this.props.notificationStore.push({
      _id: id + "/done",
      icon: CakeIcon,
      type: "success",
      title: (<FormattedMessage id="system.setup.basic.restart.done.title" />),
      children: (<FormattedMessage id="system.setup.basic.restart.done.description" />)
    });
  }

  /*async onSave(values) {
    const id = "restart/" + uuid();
    try {
      this.props.notificationStore.push({
        _id: id + "/wait",
        timeout: 0,
        canClose: false,
        icon: HourglassFullIcon,
        type: "info",
        title: (<FormattedMessage id="system.setup.basic.restart.wait.title" />),
        children: (<FormattedMessage id="system.setup.basic.restart.wait.description" />)
      });
      const { data } = await put("/api/system/config/system", values);
      await this.setStateAsync({ config: data });
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
        ? `http://${config.domains[0]}:${config.ports.http}/`
        : `https://${config.domains[0]}:${config.ports.https}/`;
      console.log("url", { url })
      // Navigate normally to force SSR refresh.
      window.location.href = url;
    } catch (error) {
      console.error("Failed to apply config", error);
      this.props.notificationStore.close(id + "/wait");
      this.props.notificationStore.pushError(error);
    }
  }

  async restartServer() {
    const { data: oldServerId } = await get("/api/system/ping");
    await post("/api/system/restart", { now: true });
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
  }*/

  render() {
    return ([
      this.renderWelcome(),
      this.renderSettings(),
      this.renderJson(),
    ]);
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
    return (<Card key="language">
      <p><FormattedMessage id="system.setup.basic.text" /></p>
      <div>
        <SettingsForm data={this.state.config} onSubmit={this.onSave} onChange={this.onChange} />
      </div>
    </Card>);
  }

  renderJson() {
    const { _id, __v, ...config } = this.state.config;
    return (<Card style={{ content: { padding: 0 } }}>
      <div key="json" style={{ height: 350 }}>
        <EditorCode mode="json" value={JSON.stringify(config, null, 2)} onChange={this.onChangeJson} />
      </div>
    </Card>)
  }
}));
