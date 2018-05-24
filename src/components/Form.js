/**
 * This is the form component. It is the Heart of the Form in Helios.
 * 
 * *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** 
 * 
 * The Form Component accepts the following props:
 * 
 * * elements: FormField[]
 * This is an array of all your form fields. The available form fields will be explained further down.
 * 
 * * onSubmit(data: any)
 * The function that is called once all values have been entered and validators have passed.
 * 
 * * data: any (Optional)
 * The data to be prefilled into the form. Keep in mind that the data will just act as default values 
 * and not override any user input.
 * 
 * * submitText: ReactNode (Optional)
 * The text on the Submit button.
 * 
 * *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** 
 * 
 * Every element (passed to the elements prop array) contains the following keys:
 * 
 * * type: string
 * Probably the most important property. This value defines what kind of field we have. All field types
 * are explained further down.
 * 
 * * key: string
 * The data index of this value. Make sure that it is the same key as in data, or the field cannot be 
 * prefilled. Must be unique, duh.
 * 
 * * name: ReactNode
 * The name of the field to display to meatbags.
 * 
 * * ignoreData: boolean (Optional)
 * Should the value in the data prop be ignored for this field? If true then this field will always have 
 * its default value regarldess of what the data prop contains.
 * 
 * * validator(value: data[key], data: any) (Optional)
 * This function validates the field. If the field value is OK, feel free to simply return undefined.
 * If not, return an object with { error: true, message: "Your Message Here!"}.
 * You can optionally also return { error: false, message: "Your Hint Here!", forceDisplay: true} to  
 * display a message even if validation passed. 
 * The message can in all cases be a ReactNode.
 * 
 * *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** 
 * 
 * *** Field Type: text
 * 
 * Your bog-basic text input. This field has the following specialized keys:
 * 
 * * placeholder: string (Optional)
 * The value that will be displayed if no value has been entered. Does not affect the output passed to 
 * submit.
 * 
 * * mode: string (Optional)
 * The input mode. Valid values: text, password, email, tel
 * 
 * *** Field Type: checkbox
 * 
 * Toggle on, toggle off. Nothing special here!
 * 
 * *** Field tye: field
 * 
 * Allows you to upload a file to base64 data. A file looks like this:
 * { name: "my-file.png", size: 21000, type: "image/png", data: "data:image/png;base64,..." }
 * 
 * * multiple: boolean (Optional)
 * If true, you can upload multiple files instead of one. As a result, the onSubmit function will 
 * recceive an array of files.
 */
import React from "react";
import fp from "../fp";

class Form extends React.Component {
  constructor(p) {
    super(p);
    this.mounted = false;
    this.state = {
      result: {},
      waiting: false,
      fieldMeta: {}
    };
  }

  componentDidMount() { this.mounted = true; }
  componentWillUnmount() { this.mounted = false; }

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
    const { waiting } = this.state;
    return (<a disabled={waiting} className="button is-primary" onClick={this.onSubmit}>
      {submitText || "Submit"}
    </a>);
  }

  renderFormElement = (element) => {
    switch (element.type) {
      case "text": return this.renderFormElementText(element);
      case "checkbox": return this.renderFormElementCheckbox(element);
      case "file": return this.renderFormElementFile(element);
    }
  }

  renderFormElementFile({ key, name, multiple }) {
    const { waiting } = this.state;
    const meta = this.getFieldMeta(key);
    return (<div className="field" key={key}>
      <label className="label">{name}</label>
      <div className="contol">
        <div className="file has-name">
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              ref={this.makeRef(key)}
              disabled={waiting}
              multiple={multiple}
              onChange={(e) => this.setFieldMeta(key, [...e.currentTarget.files].map(f => f.name))} />
            <span className="file-cta">
              <span className="file-icon"><i className="fas fa-upload" /></span>
              <span className="file-label">Choose a file…</span>
            </span>
            <span className="file-name">{this.renderFileList(meta)}</span>
          </label>
        </div>
      </div>
      {this.renderValidationResult(this.getValidationResult(key))}
    </div>);
  }

  renderFileList(files) {
    if (!files || !files.length) return "No files selected…";
    if (files.length !== 1) return `${files.length} files selected.`;
    return files[0];
  }

  renderFormElementText({ key, name, ignoreData, mode, placeholder }) {
    const { waiting } = this.state;
    return (<div className="field" key={key}>
      <label className="label">{name}</label>
      <div className="contol">
        <input
          className="input"
          type={mode || "text"}
          ref={this.makeRef(key)}
          disabled={waiting}
          defaultValue={ignoreData ? undefined : this.getData(key)}
          placeholder={placeholder} />
      </div>
      {this.renderValidationResult(this.getValidationResult(key))}
    </div>);
  }

  renderFormElementCheckbox({ key, name, ignoreData }) {
    const { waiting } = this.state;
    return (<div className="field" key={key}>
      <div className="contol">
        <label className="checkbox">
          <input
            type="checkbox"
            ref={this.makeRef(key)}
            disabled={waiting}
            defaultChecked={ignoreData ? false : this.getData(key)} />
          {this.renderValidationResult(this.getValidationResult(key))}
        </label>
      </div>
    </div>);
  }

  renderValidationResult(result) {
    if (result && result.error) return (<span className="tag is-danger"><i className="fas fa-exclamation-triangle" />&nbsp;{result.message}</span>);
    if (result && result.forceDisplay) return (<span className="tag is-info"><i className="fas fa-info" />&nbsp;{result.message}</span>);;
    return null;
  }

  onSubmit = e => {
    e.preventDefault();
    const { onSubmit } = this.props;
    this.setState({ waiting: true });
    this.getValidatedValues()
      .then(({ result, values }) => {
        console.log("Form submit!", "result", result, "values", values);
        if (this.mounted) this.setState({ result });
        Promise.resolve(onSubmit(values))
          .then(res => this.mounted && this.setState({
            waiting: false,
            result: { ...result, ...res }
          }))
          .catch(err => this.mounted && this.setState({
            waiting: false,
            result: { ...result, ...err }
          }));
      })
      .catch(error => {
        console.error("Form submit!", "error", error);
        if (this.mounted) this.setState({ result: error, waiting: false });
      });
  }

  validate(elements, data) {
    return elements.reduce((a, e) => {
      const result = e.validator && e.validator(data[e.key], data);
      return { ...a, [e.key]: result };
    }, {});
  }

  setFieldMeta(key, data) { this.setState(s => ({ fieldMeta: { ...s.fieldMeta, [key]: data } })); }
  getFieldMeta(key) { return this.state.fieldMeta[key]; }
  getValidationResult(key) { return this.state.result[key]; }

  getValidatedValues() {
    const { elements } = this.props;
    return this.getValues()
      .then(values => {
        const result = this.validate(elements, values);
        const hasError = elements.find(element => result[element.key] && result[element.key].error) !== undefined;
        if (hasError) throw result;
        return { result, values };
      }, ({ key, error }) => {
        throw { [key]: { error: true, message: error } }
      });
  }

  getValues() {
    const { elements, data } = this.props;
    const promises = elements.map(element => Promise.resolve(this.getValue(element))
      .then(value => ({ [element.key]: value }), error => { throw { key: element.key, error } }));
    return Promise.all(promises)
      .then(values => ({ ...(data || {}), ...fp.arrayToObject(values) }));
  }

  getValue = (element) => {
    const { data } = this.props;
    const value = data ? data[element.key] : undefined;
    const html = this.getRef(element.key);
    switch (element.type) {
      case "text": {
        if (html) return html.value;
        if (value !== undefined) return value;
        return "";
      }
      case "checkbox": {
        if (html) return html.checked;
        if (value !== undefined) return value;
        return false;
      }
      case "file": {
        if (html) {
          const files = [...html.files];
          if (element.multiple) return Promise.all(files.map(uploadFile))
          if (files.length) return uploadFile(files[0]);
        }
        if (value !== undefined) return value;
        if (element.multiple) return [];
        return { name: "", size: 0, type: "", data: "" };
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

const uploadFile = file => new Promise((res, rej) => {
  const reader = new FileReader();
  reader.onload = data => res({
    name: file.name,
    size: file.size,
    type: file.type,
    data: data.target.result
  });
  reader.onerror = rej;
  reader.readAsDataURL(file);
});

export default Form;