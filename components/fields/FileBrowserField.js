import React from 'react';
import { withDynamic } from "../system/Dynamic";
import classnames from "classnames";
import UploadIcon from 'mdi-react/UploadIcon';
import { FormattedMessage } from 'react-intl';
import ValidationResult from '@react-formilicious/core/validators/ValidationResult';

const FileBrowserField = withDynamic({
  jodit: () => import("jodit"),
  style: () => import("jodit/build/jodit.min.css")
}, class FileBrowserField extends React.PureComponent {
    constructor(p) {
      super(p);
      this.selectFile = this.selectFile.bind(this);
      this.selectedFile = this.selectedFile.bind(this);
      this.state = {

      }
    }

    componentDidMount() {
      // FIXME: I'd rather have this working natively, but this is OK for now
      if (!document.getElementById("jodit-style")) {
        const style = document.createElement("style");
        style.id = "jodit-style";
        style.innerHTML = this.props.style;
        document.head.appendChild(style);
      }
      // Create the file browser as a class property to let it live outside of the react world.
      this.fileBrowser = new this.props.jodit.modules.FileBrowser(undefined, {
        ajax: {
          url: "/api/files/browser"
        },
        uploader: {
          url: "/api/files/upload"
        }
      });
    }

    componentWillUnmount() {
      if (this.fileBrowser) {
        this.fileBrowser.close();
      }
    }

    /**
     * Called whenever the user clicks on the "Select file" button in the form. Opens the file browser.
     * @param {Event} e The event.
     */
    selectFile(e) {
      e.preventDefault();
      this.fileBrowser.open(this.selectedFile, !!this.props.onlyImages);
    }

    /**
     * Called whenever the user selects a file in the file browser.
     * @param {{baseurl: string, files: string[]}} e The event.
     */
    selectedFile(e) {
      const { onChange, multiple } = this.props;
      onChange(multiple ? e.files : (e.files[0] || ""));
    }

    render() {
      const {
        name, system: { waiting }, value, field
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
                onClick={this.selectFile} />
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

    /**
     * Renders the currently selected files.
     * @param {string[]} files The file names.
     */
    renderFileList(files) {
      if (!files || !files.length) return (<FormattedMessage id="form.noFilesSelected" />);
      if (files.length !== 1) return (<FormattedMessage id="form.filesSelected" values={{ n: files.length }} />);
      return files[0];
    }
  });

/**
 * Gets the default field value. We cannot do this via a static function since the class is wrapped in a withDynamic HOC.
 */
FileBrowserField.getDefaultValue = function getDefaultValue() {
  return [];
}

export default FileBrowserField;
