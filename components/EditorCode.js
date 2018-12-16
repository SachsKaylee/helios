import * as React from "react";
import Head from "next/head";

export default class EditorCode extends React.Component {
  constructor(p) {
    super(p);
    this.ref = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.aceLoaded = this.aceLoaded.bind(this);
  }

  onChange() {
    if (this.ace) {
      this.props.onChange(this.ace.getValue());
    }
  }

  UNSAFE_componentWillReceiveProps(next) {
    if (next.mode !== this.props.mode) {
      this.setMode(next.mode);
    }
    if (next.readOnly !== this.props.readOnly) {
      this.setMode(next.readOnly);
    }
  }

  aceLoaded() {
    this.initAce();
  }

  initAce() {
    this.ace = window.ace.edit(this.ref.current);
    this.ace.setTheme("ace/theme/chrome");
    this.setMode(this.props.mode);
    this.setReadOnly(this.props.readOnly);
    this.ace.setValue(this.props.value, 1);
    this.ace.on("change", this.onChange);
  }

  componentDidMount() {
    if ("ace" in window) {
      this.initAce();
    } else {
      let script = document.getElementById("jodit_ace_editor");
      if (!script) {
        script = document.createElement("script");
        script.className = "jodit_ace_editor";
        script.id = "jodit_ace_editor";
        script.src = "/node_modules/ace-builds/src-min/ace.js";
        script.type = "text/javascript";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", this.aceLoaded);
    }
  }

  componentWillUnmount() {
    if (this.ace) {
      this.ace.destroy();
      this.ace = null;
    }
  }

  setReadOnly(readOnly) {
    if (this.ace) {
      this.ace.setReadOnly(!!readOnly);
    }
  }

  setMode(mode) {
    if (this.ace) {
      this.ace.session.setMode(`ace/mode/${mode || "jsx"}`);
    }
  }

  render() {
    return (<div className="wrapper">
      <div className="editor" ref={this.ref} />
      <style jsx>{`
      .wrapper {
        height: 100%;
      }
      .editor {
        height: 100%;
        border: 1px solid #ccc;
        box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 2px 1px rgba(10, 10, 10, 0.1);
      }
      `}</style>
    </div>);
  }
}
