import React from 'react';
import Card from "../layout/Card";
import EditorControls from "./EditorControls";
import EditorRichText from './../EditorRichText';

class CardEditor extends React.PureComponent {
  render() {
    return (<EditorControls {...this.props}>
      <Card>
        <EditorRichText
          onChange={content => this.props.onChange({ id: this.props.id, type: "card", content })}
          value={this.props.content} />
      </Card>
    </EditorControls>);
  }
}

export default CardEditor;
