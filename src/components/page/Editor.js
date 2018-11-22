import React from 'react';
import CardEditor from "./CardEditor";
import ColumnsEditor from "./ColumnsEditor";
import Chooser from "./Chooser";
import splice from "../../utils/splice";
import { uuid } from "../../utils/uuid";

class Editor extends React.PureComponent {
  onMoveUp(element) {
    return () => {
      const index = this.props.elements.indexOf(element);
      if (index !== 0) {
        const elements = [...this.props.elements];
        elements[index] = elements[index - 1];
        elements[index - 1] = element;
        this.props.onChange(elements);
      }
    }
  }

  onMoveDown(element) {
    return () => {
      const index = this.props.elements.indexOf(element);
      if (index !== this.props.elements.length - 1) {
        const elements = [...this.props.elements];
        elements[index] = elements[index + 1];
        elements[index + 1] = element;
        this.props.onChange(elements);
      }
    }
  }

  onDelete(element) {
    return () => {
      const index = this.props.elements.indexOf(element);
      const elements = splice(this.props.elements, index, 1);
      this.props.onChange(elements);
    }
  }

  onAdd(element) {
    return () => {
      const index = this.props.elements.indexOf(element);
      const elements = splice(this.props.elements, index + 1, 0, [{ type: "chooser", id: uuid() }]);
      this.props.onChange(elements);
    }
  }

  onChange(element) {
    return (newElement) => {
      const index = this.props.elements.indexOf(element);
      const elements = splice(this.props.elements, index, 1, [newElement]);
      this.props.onChange(elements);
    }
  }

  render() {
    return (this.props.elements.map((element, index) => {
      const props = {
        index: index,
        count: this.props.elements.length,
        onDelete: this.onDelete(element),
        onChange: this.onChange(element),
        onAdd: this.onAdd(element),
        onMoveDown: this.onMoveDown(element),
        onMoveUp: this.onMoveUp(element),
        ...element
      };
      switch (element.type) {
        case "card": return (<CardEditor key={element.id} {...props} />);
        case "columns": return (<ColumnsEditor key={element.id} {...props} />);
        case "chooser": return (<Chooser key={element.id} {...props} />);
        default: return (<p>{JSON.stringify(element)}</p>);
      }
    }));
  }
}

export default Editor;
