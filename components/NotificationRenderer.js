import React from "react";
import Notification from "./Notification";

export default class extends React.Component {
  render() {
    const { notifications, children, onClose } = this.props;
    return notifications.length
      ? notifications.map(n => (<Notification key={n._id} {...n} onClose={() => onClose(n._id)} />))
      : children || null;
  }
}
