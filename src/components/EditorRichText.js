import React from "react";
import { Editor } from 'slate-react';
import { serializeSingle } from "../simple-html-serializer";
import { Value } from "slate";
import Plain from "slate-plain-serializer";

export const dataToValue = (value = "") => {
  return "string" === (typeof value)
    ? Plain.deserialize(value)
    : Value.isValue(value)
      ? value
      : Value.fromJSON(value);
}

export default class EditorRichText extends React.Component {
  render() {
    const { rules, ...props } = this.props;
    return (<div>
      <Editor
        renderNode={this.renderNode}
        renderMark={this.renderMark}
        ref={this.props.editorRef}
        {...props} />
    </div>);
  }

  renderNode = props => {
    const { rules } = this.props;
    const { attributes, children, node } = props;
    return serializeSingle(rules, node, children, attributes);
  }

  renderMark = props => {
    const { rules } = this.props;
    const { attributes, children, mark } = props;
    return serializeSingle(rules, mark, children, attributes);
  }
}