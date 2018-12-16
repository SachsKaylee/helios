import React from 'react';
import EditorControls from './../EditorControls';
import EditorCode from "../../EditorCode";

export default class CodeEditor extends React.PureComponent {
  constructor(p) {
    super(p);
  }

  onChange(values) {
    this.props.onChange({
      id: this.props.id,
      type: "code",
      mode: this.props.mode || "javascript",
      content: this.props.content || "",
      ...values
    });
  }

  render() {
    const { mode = "javascript", content = "" } = this.props;
    return (<EditorControls {...this.props} custom={{
      additional: (<input
        className="input"
        type="text"
        value={mode}
        placeholder="…"
        onChange={e => this.onChange({ mode: e.target.value })} />)
    }}>
      <EditorCode value={content} mode={mode} onChange={content => this.onChange({ content })} />
    </EditorControls>);
  }
};
