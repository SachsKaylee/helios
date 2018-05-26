import React from "react";
import { Editor } from 'slate-react';
import { defaultRules } from "../slate-renderer";
import { serializeSingle } from "../simple-html-serializer";

const editorCode = {
  color: "black"
}

export default class EditorRichText extends React.Component {
  render() {
    return (<div>
      <Editor
        renderNode={this.renderNode}
        renderMark={this.renderMark}
        {...this.props} />
    </div>);
  }

  renderNode = props => {
    const { attributes, children, node } = props;
    return serializeSingle(defaultRules, node, children, attributes);
  }

  renderMark = props => {
    const { attributes, children, mark } = props;
    return serializeSingle(defaultRules, mark, children, attributes);
  }
}