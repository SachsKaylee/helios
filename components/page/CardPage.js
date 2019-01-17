import React from 'react';
import Card from "../layout/Card";

class CardPage extends React.PureComponent {
  render() {
    return (<Card>
      <div class="user-content" dangerouslySetInnerHTML={{ __html: this.props.content }} />
    </Card>);
  }
}

export default CardPage;
