import * as React from "react";
import ValidationResult from "@react-formilicious/core/validators/ValidationResult";
import classnames from "classnames"
import UploadIcon from "mdi-react/UploadIcon";
import { FormattedMessage } from "react-intl";

export default class FileField extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.input = React.createRef();
    this.state = {
      dragging: false
    };
  }

  static getDefaultValue() {
    return [];
  }

  uploadFile(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = data => res({
        name: file.name,
        size: file.size,
        type: file.type,
        data: data.target.result
      });
      // todo: progress indicator
      reader.onabort = rej;
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  async onChange(e) {
    if (e.currentTarget.files.length === 0) {
      return;
    }
    const { multiple, onChange } = this.props;
    const nativeArray = [...e.currentTarget.files]
    if (multiple) {
      onChange(await Promise.all(nativeArray.map(this.uploadFile)))
    } else if (nativeArray.length) {
      onChange(await this.uploadFile(nativeArray[0]));
    } else {
      onChange({ name: "", size: 0, type: "", data: "" });
    }
  }

  onDrop(e) {
    e.preventDefault();
    this.input.files = e.dataTransfer.files;
    this.setState({ dragging: false });
  }

  onDragOver(e) {
    e.preventDefault();
    console.log("DRAG OVER")
    this.setState({ dragging: true });
  }

  onDragLeave() {
    this.setState({ dragging: false });
  }

  render() {
    const {
      multiple = false, name,
      system: { waiting }, value, field
    } = this.props;
    const data = Array.isArray(value) ? value : [value];
    return (<div className="field" onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDrop={this.onDrop} >
      <label className="label">{name}</label>
      <div className="contol">
        <div className={classnames("file", "has-name", "is-fullwidth", this.state.dragging && "is-dark")}>
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              ref={input => this.input = input}
              disabled={waiting}
              onChange={this.onChange}
              multiple={multiple} />
            <span className="file-cta">
              <span className="file-icon"><UploadIcon /></span>
              <span className="file-label"><FormattedMessage id="form.chooseFile" /></span>
            </span>
            <span className="file-name">{this.renderFileList(data)}</span>
          </label>
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