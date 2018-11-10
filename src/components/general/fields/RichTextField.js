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
    this.editorRef = React.createRef();
  }

  onChange({ value }) {
    const { onChange, system: { waiting } } = this.props;
    if (waiting) {
      return;
    }
    if (equals(this.props.value.toJSON(), value.toJSON())) {
      return;
    }
    onChange(value).catch(e => console.warn("onChange Error", e));
  }

  shouldComponentUpdate(props) {
    // Exclude value to check it later, exclude system(it contains ALL other fields), exclude
    // onChange since its an arrow function(this could actually be considered a bug!)
    const { value: currentValue, system: currentSystem, onChange: _1, ...currentProps } = this.props;
    const { value: nextValue, system: nextSystem, onChange: _2, ...nextProps } = props;
    // However we cannot fully ignore system since it contains the waiting prop.
    if (currentSystem.waiting !== nextSystem.waiting) {
      return true;
    }
    // Check if the other props have changed
    if (!equals(currentProps, nextProps)) {
      return true;
    }
   // Here is the actual check for changes
    return !equals(currentValue.toJSON(), nextValue.toJSON());
  }

  render() {
    const {
      name, disableToolbar, placeholder, plugins, rules, value,
      field, system: { waiting } // todo: Implement waiting prop
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
              editorRef={this.editorRef}
              onChange={this.onChange} />
          </div>
          {!disableToolbar && (<div className="column">
            <EditorToolbar
              editor={this.editorRef}
              stylesChooser={true} />
          </div>)}
        </div>
      </div>
      <ValidationResult {...field} />
    </div>);
  }
}