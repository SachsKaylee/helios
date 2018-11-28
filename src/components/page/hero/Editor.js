import React from 'react';
import classnames from 'classnames';
import EditorControls from './../EditorControls';
import NotificationStore from './../../../store/Notification';
import withStores from './../../../store/withStores';
import { FormattedMessage, injectIntl } from "react-intl";

export default withStores(NotificationStore, injectIntl(class HeroEditor extends React.PureComponent {
  constructor(p) {
    super(p);
    this.showVariantChooser = this.showVariantChooser.bind(this);
  }

  onChange(values) {
    this.props.onChange({
      id: this.props.id,
      type: "hero",
      variant: this.props.variant || "default",
      title: this.props.title,
      subtitle: this.props.subtitle,
      ...values
    });
  }

  showVariantChooser() {
    const currentVariant = this.props.variant || "default";
    this.props.notificationStore.push({
      //title: (<FormattedMessage id="page.manage.chooseType"/>),
      type: currentVariant,
      children: (<span><FormattedMessage id="page.manage.currentType" />: <FormattedMessage id={`page.manage.types.${currentVariant}`} /></span>),
      buttons: ["default", "primary", "info", "success", "warning", "danger", "light", "dark"].map(variant => ({
        _id: variant,
        type: variant,
        text: (<FormattedMessage id={`page.manage.types.${variant}`} />),
        action: () => this.onChange({ variant })
      }))
    });
  }

  render() {
    const currentVariant = this.props.variant || "default";
    return (<EditorControls {...this.props} custom={{
      additional: (<a onClick={this.showVariantChooser} className={classnames("button", "is-" + currentVariant)}><FormattedMessage id="page.manage.chooseType" /></a>)
    }}>
      <div className={classnames("hero", "is-" + currentVariant)} style={{ padding: "5px" }}>
        <h1 className="title">
          <input
            className={classnames("input", "is-" + currentVariant)}
            type="text"
            style={{ fontSize: "2rem", backgroundColor: "rgba(1,1,1,0.1)" }}
            value={this.props.title}
            placeholder={this.props.intl.formatMessage({ id: "title" })}
            onChange={e => this.onChange({
              title: e.target.value
            })} />
        </h1>
        <h2 className="subtitle">
          <input
            className={classnames("input is-" + currentVariant)}
            type="text"
            style={{ backgroundColor: "rgba(1,1,1,0.1)" }}
            value={this.props.subtitle}
            placeholder={this.props.intl.formatMessage({ id: "subtitle" })}
            onChange={e => this.onChange({
              subtitle: e.target.value
            })} />
        </h2>
      </div>
    </EditorControls>);
  }
}));
