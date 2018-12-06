import React from 'react';
import Card from "../layout/Card";
import Columns from "../layout/Columns";

class CardEditor extends React.PureComponent {
  render() {
    return (<Columns
      size={this.props.size}
      sidebar={(<Card style={{height: "100%"}}>
        <div dangerouslySetInnerHTML={{ __html: this.props.content[1] }} />
      </Card>)}>
      <Card style={{height: "100%"}}>
        <div dangerouslySetInnerHTML={{ __html: this.props.content[0] }} />
      </Card>
    </Columns>);
  }
}

export default CardEditor;
