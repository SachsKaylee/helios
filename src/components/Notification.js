import React from "react";
import classnames from "classnames";

export default class Notification extends React.PureComponent {
  constructor(p) {
    super(p);
    this.onClose = this.onClose.bind(this);
    this.state = {
      closed: false
    }
  }

  onClose() {
    const { onClose } = this.props;
    this.setState({ closed: true }, () => onClose && onClose());
  }

  render() {
    const { canClose, children, timeout, elapsed, title, icon: Icon, type } = this.props;
    const { closed } = this.state;
    return (!closed && (<div className={classnames("pop-in", "notification", type && "is-" + type)}>
      {canClose && (<button className="delete" onClick={this.onClose}></button>)}
      {(title || Icon) && <p><Icon className="mdi-icon-spacer" /><strong>{title}</strong></p>}
      {children}
      {timeout && (<progress className="progress is-small overlay-notification-progress" value={elapsed} max={timeout} />)}
    </div>));
  }
}
