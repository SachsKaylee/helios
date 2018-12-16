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
    const { canClose, children, timeout, elapsed, title, icon: Icon, type, buttons } = this.props;
    const { closed } = this.state;
    return (!closed && (<div className={classnames("pop-in", "notification", type && "is-" + type)}>
      {canClose && (<button className="delete" onClick={this.onClose}></button>)}
      {(title || Icon) && <p>{Icon ? <Icon className="mdi-icon-spacer" /> : null}<strong>{title}</strong></p>}
      {children}
      {timeout ? (<progress className="progress is-small overlay-notification-progress" value={elapsed} max={timeout} />) : null}
      {buttons && buttons.length ? (<div className="buttons">
        {buttons.map((button, i) => <a key={button._id + "/" + i} className={classnames("button", button.type && "is-" + button.type)} onClick={() => {
          if (button.action) {
            button.action(button, this.state);
          }
          this.onClose();
        }}>{button.text}</a>)}
      </div>) : null}
    </div>));
  }
}
