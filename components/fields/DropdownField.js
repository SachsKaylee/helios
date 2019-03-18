import * as React from "react";
import ValidationResult from "@react-formilicious/core/validators/ValidationResult";
import classnames from "classnames"
import MenuDownOutlineIcon from "mdi-react/MenuDownOutlineIcon";
import { FormattedMessage } from "react-intl";

export default class DropdownField extends React.Component {
  constructor() {
    super();
  }

  static getDefaultValue() {
    return "";
  }

  render() {
    const {
      multiple = false, name,
      system: { waiting }, value, field,
      values = []
    } = this.props;
    const selected = values.find(({ key }) => key === value);
    return (<div className="field" onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop} >
      <label className="label">{name}</label>
      <div className="contol">
        <div className="dropdown is-hoverable">
          <div className="dropdown-trigger">
            <button type="button" className="button" aria-haspopup="true" aria-controls="dropdown-menu2">
              <span>{selected ? selected.label : <FormattedMessage id="form.select" />}</span>
              <span className="icon is-small">
                <MenuDownOutlineIcon />
              </span>
            </button>
          </div>
          <div className="dropdown-menu" id="dropdown-menu2" role="menu">
            <div className="dropdown-content">
              {values.map(({ key, label }, i) => (<a onClick={() => this.props.onChange(key)} key={i + "-" + key} className="dropdown-item">
                {label}
              </a>))}
            </div>
          </div>
        </div>
      </div>
      <ValidationResult {...field} />
    </div>);
  }

  renderFileList(files) {
    if (!files || !files.length) return (<FormattedMessage id="form.noFilesSelected" />);
    if (files.length !== 1) return (<FormattedMessage id="form.filesSelected" values={{ n: files.length }} />);
    // todo: display more than one file name if it fits on the screen
    return files[0].name;
  }
}