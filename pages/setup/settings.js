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
    window.__HELIOS_CONFIG__ = data;
    this.props.notificationStore.push({
      _id: "config-saved",
      icon: CakeIcon,
      type: "success",
      title: (<FormattedMessage id="system.setup.settings.saved.title" />),
      children: (<FormattedMessage id="system.setup.settings.saved.description" />)
      // todo: Relaod page button
    });
  }

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
