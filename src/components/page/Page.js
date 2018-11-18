import React from 'react';
import CardPage from "./CardPage";

class Page extends React.PureComponent {
  render() {
    return (this.props.elements.map((element, index) => {
      switch (element.type) {
        case "card": {
          return (<CardPage
            key={element.id}
            index={index}
            {...element} />);
        }
        default: {
          return null;
        }
      }
    }));
  }
}

export default Page;
