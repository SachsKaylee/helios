import React from "react";
import { Editor } from 'slate-react';
import { postRules } from "../slate-renderer";
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
    const { value } = this.props;
    return (<div>
      <Editor
        renderNode={this.renderNode}
        renderMark={this.renderMark}
        {...this.props}
        value={dataToValue(value)} />
    </div>);
  }

  renderNode = props => {
    const { attributes, children, node } = props;
    return serializeSingle(postRules(), node, children, attributes);
  }

  renderMark = props => {
    const { attributes, children, mark } = props;
    return serializeSingle(postRules(), mark, children, attributes);
  }
}