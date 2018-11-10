import * as React from "react";
import EditorRichText, { dataToValue } from "../../EditorRichText";
import ValidationResult from "@react-formilicious/core/validators/ValidationResult";
import EditorToolbar from "../../EditorToolbar";
import classnames from "classnames"
import equals from "deep-equal"

export default class RichTextField extends React.Component {
  static getDefaultValue() {
    return dataToValue("");
  }

  constructor(p) {
    super(p);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    const { onChange, system: { waiting } } = this.props;
    if (waiting) {
      return;
    }
    if (equals(this.props.value.toJSON(), value.value.toJSON())) {
      return;
    }
    onChange(value.value).catch(e => console.warn("onChange Error", e));
  }

  shouldComponentUpdate(props) {
    const { value: currentValue, system: currentSystem, onChange: _1, ...currentProps } = this.props;
    const { value: nextValue, system: nextSystem, onChange: _2, ...nextProps } = props;
    global.equals = equals;
    if (!equals(currentProps, nextProps)) {
      return true;
    }
    return !equals(currentValue.toJSON(), nextValue.toJSON());
  }

  render() {
    const {
      name, disableToolbar, placeholder, plugins, rules, value,
      field, system: { waiting }
    } = this.props;
    return (<div className="field">
      <label className="label">{name}</label>
      <div className="contol">
        <div className="columns">
          <div className={classnames("column", disableToolbar || "is-three-quarters")}>
            <EditorRichText
              plugins={plugins}
              disabled={true}
              className="textarea"
              style={{ overflowY: "auto" }}
              rules={rules}
              placeholder={placeholder}
              value={value}
              onChange={this.onChange} />
          </div>
          {!disableToolbar && (<div className="column">
            <EditorToolbar
              onChange={this.onChange}
              value={value}
              stylesChooser={true} />
          </div>)}
        </div>
      </div>
      <ValidationResult {...field} />
    </div>);
  }
}