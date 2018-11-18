import React from 'react';
import Columns from "../layout/Columns";
import AddIcon from 'mdi-react/AddIcon';
import DeleteIcon from 'mdi-react/DeleteIcon';
import ArrowDownIcon from 'mdi-react/ArrowDownIcon';
import ArrowUpIcon from 'mdi-react/ArrowUpIcon';
import { FormattedMessage } from 'react-intl';

class EditorControls extends React.PureComponent {
  render() {
    return (<Columns sidebar={this.renderSidebar()} size={1}>
      {this.props.children}
    </Columns>);
  }

  renderSidebar() {
    const { count, index } = this.props;
    return (<div>
      <label className="label"><FormattedMessage id="page.move.title" /></label>
      <p className="buttons">
        <a className="button" disabled={index === 0} onClick={index !== 0 ? this.props.onMoveUp : undefined}>
          <ArrowUpIcon />
          <FormattedMessage id="page.move.up" />
        </a>
        <a className="button" disabled={index === count - 1} onClick={index !== count - 1 ? this.props.onMoveDown : undefined}>
          <ArrowDownIcon />
          <FormattedMessage id="page.move.down" />
        </a>
        {this.props.custom && this.props.custom.move}
      </p>

      <label className="label"><FormattedMessage id="actions" /></label>
      <p className="buttons">
        <a className="button is-danger" disabled={count === 1} onClick={count !== 1 ? this.props.onDelete : undefined}>
          <DeleteIcon />
          <FormattedMessage id="delete" />
        </a>
        <a className="button is-primary" onClick={this.props.onAdd}>
          <AddIcon />
          <FormattedMessage id="add" />
        </a>
        {this.props.custom && this.props.custom.actions}
      </p>

      {this.props.custom && this.props.custom.additional && (<>
        <label className="label"><FormattedMessage id={`page.type.${this.props.type}`} /></label>
        <p className="buttons">
          {this.props.custom.additional}
        </p>
      </>)}
    </div>)
  }
}


export default EditorControls;
