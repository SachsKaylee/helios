import React from 'react';
import Card from "../layout/Card";
import Columns from "../layout/Columns";
import EditorRichText from './../EditorRichText';
import EditorControls from './EditorControls';

class CardEditor extends React.PureComponent {
  render() {
    return (<EditorControls {...this.props} custom={{
      additional: (<input
        className="input"
        type="number"
        value={this.props.size || 4}
        placeholder="…"
        onChange={e => {
          const parsed = parseInt(e.target.value);
          let value = Number.isInteger(parsed) ? parsed : (this.props.size || 4);
          value = value < 3 ? 3 : value > 9 ? 9 : value;
          this.props.onChange({
            id: this.props.id,
            type: "columns",
            size: value,
            content: this.props.content
          })
        }} />)
    }}>
      <Columns
        size={this.props.size || 4}
        sidebar={(<Card style={{ height: "100%" }}>
          <EditorRichText
            onChange={value => this.props.onChange({
              id: this.props.id,
              type: "columns",
              size: this.props.size || 4,
              content: [this.props.content && this.props.content[0] || "", value]
            })}
            value={this.props.content && this.props.content[1] || ""} />
        </Card>)}>
        <Card style={{ height: "100%" }}>
          <EditorRichText
            onChange={value => this.props.onChange({
              id: this.props.id,
              type: "columns",
              size: this.props.size || 4,
              content: [value, this.props.content && this.props.content[1] || ""]
            })}
            value={this.props.content && this.props.content[0] || ""} />
        </Card>
      </Columns>
    </EditorControls>);
  }
}

export default CardEditor;
