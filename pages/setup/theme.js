import React from "react";
import { get, put } from "axios";
import { injectIntl, FormattedMessage } from "react-intl";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import Card from "../../components/layout/Card";
import classnames from "classnames";
import ContentSaveIcon from 'mdi-react/ContentSaveIcon';
import EditorCode from "../../components/EditorCode";
import crossuser from "../../utils/crossuser";

/**
 * This page is used to select the bulmaswatch theme.
 */
export default withStores(NotificationStore, injectIntl(class ThemePage extends React.PureComponent {
  static async getInitialProps(ctx) {
    const opts = crossuser(ctx.req);
    let themes = [{
      name: "",
      version: "",
      description: "system.setup.theme.type.none",
      descriptionIsIntl: true,
      css: "",
      license: "UNLICENSE"
    }];
    try {
      // todo: Consider fully loading the on the client -> Server may not have internet access, but the user may
      const { data: res } = await get("https://jenil.github.io/bulmaswatch/api/themes.json", opts);
      themes = themes.concat(res.themes.map(theme => ({ ...theme, version: res.version, license: "MIT" })));
    } catch (error) {
      console.error("Failed to load theme library", error);
    }
    let active = themes[0];
    try {
      const { data: res } = await get("/api/system/config/theme", opts);
      active = { ...res, license: res.name === "" ? "UNLICENSE" : "MIT", descriptionIsIntl: true, description: "system.setup.theme.type.active" };
      const exists = themes.find(theme => theme.name === active.name && theme.version === active.version);
      if (!exists) {
        themes.splice(1, 0, active);
      }
      // todo: Add "active" to "themes" if missing (could be the case if bulmaswatch gets an update)
    } catch (error) {
      console.error("Failed to load active theme", error);
    }
    return { themes, active };
  }

  constructor(p) {
    super(p);
    this.state = {
      active: this.props.active,
      saving: false
    }
    this.onChangeCSS = this.onChangeCSS.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
  }

  /**
   * React lifecycle.
   */
  componentDidMount() {
    this.props.setPageTitle(this.props.intl.formatMessage({ id: "system.setup.theme.title" }));
  }

  /**
   * Called once the user selects a theme.
   */
  onSelect(theme) {
    this.setState({ active: theme });
  }

  /**
   * Called once the user manually changes the CSS code of their website.
   * @param {string} css The CSS code.
   */
  onChangeCSS(css) {
    const active = this.state.active;
    this.setState({ active: { ...active, css } });
  }

  /**
   * Called once the user clicks the save button.
   */
  onClickSave() {
    this.setState({ saving: true }, async () => {
      try {
        const { data } = await put("/api/system/config/theme", this.state.active);
        this.setState({ active: data, saving: false });
        window.location.href = window.location.href;
      } catch (error) {
        this.setState({ saving: false });
        this.props.notificationStore.pushError(error);
      }
    })
  }

  /**
   * React lifecycle.
   */
  render() {
    return (<div>
      {this.renderToolbar()}
      <Card>
        <div className="columns">
          <div className="column is-4">
            {this.renderPanel()}
          </div>
          <div className="column is-8">
            {this.renderPreview()}
          </div>
        </div>
      </Card>
    </div>);
    // todo: Credit link!!!! Check license????
  }

  /**
   * Renders the toolbar at the top. Contains the save button and optionally a CSS editor.
   */
  renderToolbar() {
    return (<Card>
      <p className="buttons" style={{ float: "right" }}>
        <a className={classnames("button", "is-primary", this.state.saving && "is-loading")} onClick={this.onClickSave}>
          <ContentSaveIcon />
          <FormattedMessage id="save" />
        </a>
      </p>
      {(this.state.active.name !== "")
        ? (<p><FormattedMessage id="system.setup.theme.license" values={{ name: this.state.active.name, license: this.state.active.license }} /></p>)
        : (<p><FormattedMessage id="system.setup.theme.enterCss" /></p>)}
      {(this.state.active.name === "") && (<div style={{ height: 300, clear: "both" }}>
        <EditorCode value={this.state.active.css} onChange={this.onChangeCSS} mode="css" />
      </div>)}
    </Card>)
  }

  /**
   * Renders the theme picker on the left.
   */
  renderPanel() {
    return (<nav className="panel">
      <div className="panel-heading">
        <FormattedMessage id="system.setup.theme.picker" />
      </div>
      {this.props.themes.map(theme => this.renderPanelItem(theme))}
    </nav>);
  }

  /**
   * Reneders a single theme in the picker on the left.
   */
  renderPanelItem(theme) {
    const { name, description, descriptionIsIntl, version } = theme;
    const onClick = () => this.onSelect(theme);
    return (<a key={name + "@" + version} onClick={onClick} className={classnames("panel-block", this.isActive(theme) && "is-active")}>
      <span className="panel-icon">
        <i className="fas fa-book" aria-hidden="true"></i>
      </span>
      {name}&nbsp;
      <span className="is-size-7">{descriptionIsIntl ? (<FormattedMessage id={description} />) : description} {version && "(v" + version + ")"}</span>
    </a>);
  }

  /**
   * Renders the selected theme preview on the right.
   */
  renderPreview() {
    const uri = this.state.active.name === "" ? "blob://" + this.state.active.css : this.state.active.css;
    return (<iframe src={`/?themeOverride=${encodeURIComponent(uri)}`} style={{ width: "100%", height: "100%", minHeight: 500 }} />);
  }

  /**
   * Checks if the given theme is active.
   * @param {{name: string, version: string}} theme The theme.
   */
  isActive({ name, version }) {
    return this.state.active.name === name && this.state.active.version === version;
  }
}));