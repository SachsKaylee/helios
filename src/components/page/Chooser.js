import React from 'react';
import Card from "../layout/Card";
import EditorControls from "./EditorControls";
import CardTextOutlineIcon from "mdi-react/CardTextOutlineIcon";
import ViewColumnIcon from "mdi-react/ViewColumnIcon";
import FlagIcon from "mdi-react/FlagIcon";
import { FormattedMessage } from "react-intl";

const allTypes = [
  { type: "card", icon: CardTextOutlineIcon },
  { type: "columns", icon: ViewColumnIcon },
  { type: "hero", icon: FlagIcon }
];

class Chooser extends React.PureComponent {
  constructor(p) {
    super(p);
    this.renderType = this.renderType.bind(this);
  }

  onSelect(type) {
    this.props.onChange({ type, id: this.props.id });
  }

  render() {
    return (<EditorControls {...this.props}>
      <Card title={<FormattedMessage id="page.add.title" />} subtitle={<FormattedMessage id="page.add.subtitle" />}>
        <p className="buttons">
          {allTypes.map(this.renderType)}
        </p>
      </Card>
    </EditorControls>);
  }

  renderType({ type, icon: Icon }) {
    return (<a className="button" key={type} onClick={() => this.onSelect(type)}>
      <Icon />
      <FormattedMessage id={`page.type.${type}`} />
    </a>)
  }
}

export default Chooser;
