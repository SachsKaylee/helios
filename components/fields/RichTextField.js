import * as React from "react";
import ValidationResult from "@react-formilicious/core/validators/ValidationResult";
import EditorRichText from "../EditorRichText";

export default class RichTextField extends React.PureComponent {
  static getDefaultValue() {
    return "";
  }

  render() {
    const { name, onChange, config, field, system: { waiting } } = this.props;
    return (<div className="field">
      <label className="label">{name}</label>
      <div className="contol">
        <EditorRichText value={this.props.value} onChange={onChange} config={{ readonly: waiting, ...config }} />
      </div>
      <ValidationResult {...field} />
    </div>);
  }
}