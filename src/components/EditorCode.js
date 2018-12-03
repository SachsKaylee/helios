import * as React from "react";
import Head from "next/head";

export default class EditorCode extends React.Component {
  constructor(p) {
    super(p);
    this.ref = React.createRef();
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    this.props.onChange(this.ace.getValue());
  }

  UNSAFE_componentWillReceiveProps(next) {
    if (next.mode !== this.props.mode) {
      this.setMode(next.mode);
    }
    if (next.readOnly !== this.props.readOnly) {
      this.setMode(next.readOnly);
    }
  }

  componentDidMount() {
    this.ace = window.ace.edit(this.ref.current);
    this.ace.setTheme("ace/theme/chrome");
    this.setMode(this.props.mode);
    this.setReadOnly(this.props.readOnly);
    this.ace.setValue(this.props.value);
    this.ace.on("change", this.onChange);
  }

  componentWillUnmount() {
    if (this.ace) {
      this.ace.destroy();
      this.ace = null;
    }
  }

  setReadOnly(readOnly) {
    this.ace.setReadOnly(!!readOnly);
  }

  setMode(mode) {
    this.ace.session.setMode(`ace/mode/${mode || "jsx"}`);
  }

  render() {
    return (<div className="wrapper">
      <Head>
        <script key="ace" class="jodit_ace_editor" type="text/javascript" src="/node_modules/ace-builds/src-min/ace.js"></script>
      </Head>
      <div className="editor" ref={this.ref} />
      <style jsx>{`
      .wrapper {
        height: 100%;
      }
      .editor {
        height: 100%;
        border: 1px solid #ccc;
        border-radius: 4px 4px 4px 4px;
      }
      `}</style>
    </div>);
  }
}
