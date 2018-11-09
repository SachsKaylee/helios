import * as React from "react";
import EditorRichText, { dataToValue } from "../../EditorRichText";
import ValidationResult from "@react-formilicious/core/validators/ValidationResult";
import EditorToolbar from "../../EditorToolbar";
import classnames from "classnames"
import equals from "deep-equal"

export default class RichTextField extends React.Component {
  static getDefaultValue() {
    return dataToValue("I am empty");
  }

  constructor(p) {
    super(p);
    this.state = {
      slateValue: dataToValue(p.value)
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({ slateValue: dataToValue(this.props.value) });
    }
  }

  onChange(value) {
    const { onChange, system: { waiting } } = this.props;
    !waiting && onChange(value.value).then(console.log).catch(e => console.warn("onChange Error", e));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !equals(this.props, nextProps) || !equals(this.state, nextState);
  }

  render() {
    const {
      name, disableToolbar, placeholder, plugins, rules,
      field, system: { waiting }
    } = this.props;
    const { slateValue } = this.state;
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
              value={slateValue}
              onChange={this.onChange} />
          </div>
          {!disableToolbar && (<div className="column">
            <EditorToolbar
              onChange={this.onChange}
              value={slateValue}
              stylesChooser={true} />
          </div>)}
        </div>
      </div>
      <ValidationResult {...field} />
    </div>);
  }
}