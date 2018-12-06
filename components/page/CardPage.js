import React from 'react';
import Card from "../layout/Card";

class CardPage extends React.PureComponent {
  render() {
    return (<Card>
      <div dangerouslySetInnerHTML={{ __html: this.props.content }} />
    </Card>);
  }
}

export default CardPage;
