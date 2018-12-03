import React from 'react';
import EditorCode from "../../EditorCode";

export default class CodePage extends React.PureComponent {
  render() {
    const { content = "", mode = "javascript" } = this.props;
    return (<div className="wrapper">
      <EditorCode readOnly value={content} mode={mode} />
      <style jsx>{`
        .wrapper {
          margin: 0 0 1.5rem 0;
          height: 200px;
        }
      `}</style>
    </div>);
  }
}
