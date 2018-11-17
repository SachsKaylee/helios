import React from "react";
import classnames from "classnames";

export default class Notification extends React.PureComponent {
  constructor(p) {
    super(p);
    this.state = {
      closed: false
    }
  }

  onClose = () => {
    const { onClose } = this.props;
    this.setState({ closed: true }, () => onClose && onClose());
  }

  render() {
    const { canClose, children, type } = this.props;
    const { closed } = this.state;
    return (!closed && (<div className={classnames("notification", type && "is-" + type)}>
      {canClose && (<button className="delete" onClick={this.onClose}></button>)}
      {children}
    </div>));
  }
}
