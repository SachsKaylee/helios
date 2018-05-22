/**
 * This is the form component. It is the Heart of the Form in Helios.
 * 
 * 
 * The Form Component accepts the following props:
 * 
 * elements (Required)
 * This is an array of all your form fields. The available form fields will be explained further down.
 * 
 * data (Optional)
 * The data to be prefilled into the form. Keep in mind that the data will just act as default values 
 * and not override any user input.
 * 
 * submitText (Optional)
 * The text on the Submit button.
 * 
 * onSubmit(values)
 * The function that is called once all values have been entered and validators have passed.
 * 
 * 
 * Every element (passed to the elements prop array) contains the following keys:
 * 
 * type: string
 * Probably the most important property. This value defines what kind of field we have. All field types
 * are explained further down.
 * 
 * key: string
 * The data index of this value. Make sure that it is the same key as in data, or the field cannot be 
 * prefilled. Must be unique, duh.
 * 
 * name: ReactNode
 * The name of the field to display to meatbags.
 * 
 * ignoreData: boolean (Optional)
 * Should the value in the data prop be ignored for this field? If true then this field will always have 
 * its default value regarldess of what the data prop contains.
 * 
 * validator(value, data) (Optional)
 * This function validates the field. If the field value is OK, feel free to simply return undefined.
 * If not, return an object with { error: true, message: "Your Message Here!"}.
 * You can optionally also return { error: false, message: "Your Hint Here!", forceDisplay: true} to display 
 * a message even if validation passed. 
 * The message can in all cases be a ReactNode.
 * 
 * 
 * Field Type: text
 * 
 * Your bog-basic text input. This field has the following specialized keys:
 * 
 * placeholder: string (Optional)
 * The value that will be displayed if no value has been entered. Does not affect the output passed to submit.
 * 
 * mode: string (Optional)
 * The input mode. Valid values: text, password, email, tel
 * 
 * Field Type: checkbox
 * 
 * Toggle on, toggle off. Nothing special here!
 */
import React from "react";
import fp from "../fp";

class Form extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      result: {}
    };
  }

  render() {
    const { elements, classes } = this.props;
    return (<form onSubmit={this.onSubmit}>
      <div>
        {elements.map(this.renderFormElement)}
      </div>
      <div className="submit-div">
        {this.renderSubmit()}
      </div>
      <style jsx>{`
        .submit-div {
          margin-top: 12px;
        }
      `}</style>
    </form>);
  }

  renderSubmit() {
    const { submitText } = this.props;
    return (<a className="button is-primary" onClick={this.obSubmit}>
      {submitText || "Submit"}
    </a>);
  }

  renderFormElement = (element) => {
    switch (element.type) {
      case "text": return this.renderFormElementText(element);
      case "checkbox": return this.renderFormElementCheckbox(element);
    }
  }

  renderFormElementText({ key, name, ignoreData, mode, placeholder }) {
    return (<div className="field" key={key}>
      <label className="label">{name}</label>
      <div className="contol">
        <input
          className="input"
          type={mode || "text"}
          ref={this.makeRef(key)}
          defaultValue={ignoreData ? undefined : this.getData(key)}
          placeholder={placeholder} />
      </div>
      {this.renderValidationResult(this.getValidationResult(key))}
    </div>);
  }

  renderFormElementCheckbox({ key, name, ignoreData }) {
    return (<div className="field" key={key}>
      <div className="contol">
        <label className="checkbox">
          <input
            type="checkbox"
            ref={this.makeRef(key)}
            defaultChecked={ignoreData ? false : this.getData(key)} />
          {this.renderValidationResult(this.getValidationResult(key))}
        </label>
      </div>
    </div>);
  }

  renderValidationResult(result) {
    if (result && result.error) {
      const { classes } = this.props;
      return (<span style={{ color: "red" }}>❌ {result.message}</span>);
    }
    if (result && result.forceDisplay) {
      return result.message;
    }
    return undefined;
  }

  obSubmit = e => {
    const { elements, onSubmit, data } = this.props;
    e.preventDefault();
    const extract = elements.map(el => ({
      [el.key]: this.getValue(el, this.getRef(el.key), data
        ? data[el.key]
        : undefined)
    }));
    const newData = { ...(data || {}), ...fp.arrayToObject(extract) };
    const result = this.validate(elements, newData);
    const hasError = elements.find(e => {
      const r = result[e.key];
      return r && r.error;
    }) !== undefined;
    console.log("validation", result, "error", hasError, "data", newData, "elements", elements)
    this.displayValidationResult(result);
    if (!hasError) {
      onSubmit(newData);
    }
  }

  validate(elements, data) {
    return elements.reduce((a, e) => {
      const result = e.validator && e.validator(data[e.key], data);
      return { ...a, [e.key]: result }
    }, {});
  }

  displayValidationResult(result) {
    this.setState({ result });
  }

  getValidationResult(key) {
    return this.state.result[key];
  }

  getValue = (element, html, data) => {
    switch (element.type) {
      case "text": {
        if (html) { return html.value; }
        if (data !== undefined) { return data; }
        return "";
      }
      case "checkbox": {
        if (html) { return html.checked; }
        if (data !== undefined) { return data; }
        return false;
      }
    }
  }

  getData(key) {
    const { data } = this.props;
    return data && data[key];
  }

  $elementRefs = {};
  getRef(name) { return this.$elementRefs[name]; }
  makeRef = name => ref => this.$elementRefs[name] = ref;
}

export default Form;