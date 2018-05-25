import React from "react";
import Notification from "./Notification";
import fp from "../fp";
import { uuid } from "../uuid";

export default class extends React.Component {
  state = {
    notifications: []
  }

  push = (p) => {
    this.setState(s => ({
      notifications: [...s.notifications, { ...p, key: uuid() }]
    }));
  }

  onClose = (p) => () => {
    const { onClose } = p;
    this.setState(s => {
      const index = s.notifications.indexOf(p);
      return index === -1
        ? null
        : { notifications: fp.splice(s.notifications, index, 1) };;
    }, () => onClose && onClose());
  }

  render() {
    const { notifications } = this.state;
    const { children } = this.props;
    return notifications.length
      ? notifications.map(n => (<Notification key={n.key} {...n} onClose={this.onClose(n)} />))
      : children || null;
  }
}