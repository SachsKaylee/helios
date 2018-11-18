import * as React from "react";
import ValidationResult from "@react-formilicious/core/validators/ValidationResult";
import classnames from "classnames";
import { FormattedMessage, injectIntl } from "react-intl";

export default injectIntl(class PathField extends React.Component {
  static getDefaultValue() {
    return [];
  }

  constructor() {
    super();
    this.state = {
      typingPath: ""
    };
  }

  render() {
    const {
      name, allowCustomPaths = true,
      field: { validated, message, initialValue },
      system: { waiting },
      value
    } = this.props;

    return (<div className="field">
      <label className="label">{name}</label>
      <div className="field is-grouped is-grouped-multiline">
        <div className="control">
          <div className="tags">
            {value.map((tag, i) => this.renderPath(tag, i))}
          </div>
        </div>
        <div className="contol">
          <div className="tags has-addons">
            <input
              className="tag is-light"
              type="text"
              disabled={waiting}
              placeholder={this.props.intl.formatMessage({ id: "form.addPath" })}
              value={this.state.typingPath}
              onChange={e => this.setState({ typingPath: e.target.value })} />
            <a className="tag is-dark" onClick={() => this.addPath(this.state.typingPath)} disabled={waiting}>
              <FormattedMessage id="add" />
            </a>
          </div>
        </div>
      </div>
      <ValidationResult validated={validated} message={message} />
    </div >);
  }

  addPath(name) {
    name = name.trim();
    const { value, onChange, system: { waiting } } = this.props;
    if (!waiting && name) {
      onChange([...value, name]);
    }
  }

  renderPath(tag, index) {
    const { waiting } = this.props;
    return (<span key={tag + "/" + index}>
      <a className={classnames("tag", waiting && "is-loading")} onClick={undefined}>{tag}</a>
      &nbsp;/&nbsp;
    </span>);
  }
});
