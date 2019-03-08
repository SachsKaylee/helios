import React from "react";
import { get, put } from "axios";
import { injectIntl, FormattedMessage } from "react-intl";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import Card from "../../components/layout/Card";
import classnames from "classnames";
import ContentSaveIcon from 'mdi-react/ContentSaveIcon';
import EditorCode from "../../components/EditorCode";

/**
 * This page is used to select the bulmaswatch theme.
 */
export default withStores(NotificationStore, injectIntl(class ThemePage extends React.PureComponent {
  static async getInitialProps(ctx) {
    let themes = [{
      name: "",
      version: "",
      description: "No Theme / Write your own CSS",
      css: ""
    }];
    try {
      // todo: Consider fully loading the on the client -> Server may not have internet access, but the user may
      const { data: res } = await get("https://jenil.github.io/bulmaswatch/api/themes.json");
      themes = themes.concat(res.themes.map(theme => ({ ...theme, version: res.version })));
    } catch (error) {
      console.error("Failed to load theme library", error);
    }
    let active = themes[0];
    try {
      const { data: res } = await get("/api/system/config/theme");
      active = res;
    } catch (error) {
      console.error("Failed to load active theme", error);
    }
    return { themes, active };
  }

  constructor(p) {
    super(p);
    this.state = {
      active: this.props.active
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
  async onClickSave() {
    const { data } = await put("/api/system/config/theme", this.state.active);
    this.setState({ active: data });
    window.location.href = window.location.href;
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

  renderToolbar() {
    return (<Card>
      <p className="buttons">
        <a className="button is-primary" onClick={this.onClickSave}>
          <ContentSaveIcon />
          <FormattedMessage id="save" />
        </a>
        {this.props.custom && this.props.custom.actions}
      </p>
      {(this.state.active.name === "") && (<div style={{ height: 300 }}>
        <EditorCode value={this.state.active.css} onChange={this.onChangeCSS} mode="css">

        </EditorCode>
      </div>)}
      {(this.state.active.name !== "") && (<p>
        <strong>{this.state.active.name}</strong> is licensed under the <a href="https://github.com/jenil/bulmaswatch/blob/gh-pages/LICENSE">MIT License</a>.
      </p>)}
    </Card>)
  }

  /**
   * Renders the theme picker on the left.
   */
  renderPanel() {
    return (<nav className="panel">
      <p className="panel-heading">
        <FormattedMessage id="system.setup.theme.picker" />
      </p>
      {this.props.themes.map(theme => this.renderPanelItem(theme))}
    </nav>);
  }

  /**
   * Reneders a single theme in the picker on the left.
   */
  renderPanelItem(theme) {
    const { name, description, thumb, css } = theme;
    const onClick = () => this.onSelect(theme);
    return (<a key={name} onClick={onClick} className={classnames("panel-block", this.state.active.name === name && "is-active")}>
      <span className="panel-icon">
        <i className="fas fa-book" aria-hidden="true"></i>
      </span>
      {name}&nbsp;
      <span className="is-size-7">{description}</span>
    </a>);
  }

  /**
   * Renders the selected theme preview on the right.
   */
  renderPreview() {
    const uri = this.state.active.name === "" ? "blob://" + this.state.active.css : this.state.active.css;
    return (<iframe src={`/?themeOverride=${encodeURIComponent(uri)}`} style={{ width: "100%", height: "100%", minHeight: 500 }} />);
  }
}));