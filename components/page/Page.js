import React from 'react';
import CardPage from "./CardPage";
import ColumnsPage from "./ColumnsPage";
import HeroPage from "./hero/Page";
import Code from "./code/Page";

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
        case "columns": {
          return (<ColumnsPage
            key={element.id}
            index={index}
            {...element} />);
        }
        case "hero": {
          return (<HeroPage
            key={element.id}
            index={index}
            {...element} />);
        }
        case "code": {
          return (<Code
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
