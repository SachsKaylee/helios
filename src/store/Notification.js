import React from "react";
import { uuid } from "../utils/uuid";

const Context = React.createContext();

const TICK_INTERVAL = 15;

export class NotificationProvider extends React.PureComponent {
  constructor(p) {
    super(p);
    this.notifications = React.createRef();
    this.push = this.push.bind(this);
    this.close = this.close.bind(this);
    this.interval = this.interval.bind(this);
    this.maybeStartTimer = this.maybeStartTimer.bind(this);
    this.maybeEndTimer = this.maybeEndTimer.bind(this);
    this.timeout = null;
    this.state = {
      notifications: []
    };
  }

  componentWillUnmount() {
    this.maybeEndTimer(true);
  }

  maybeStartTimer() {
    if (!this.timeout) {
      this.timeout = setInterval(this.interval, TICK_INTERVAL);
    }
  }

  maybeEndTimer(force = false) {
    if (!this.timeout) {
      return;
    }
    if (!force && this.state.notifications.length !== 0) {
      return;
    }
    if (force) {
      console.warn("Forcing Notification timer to stop. Some notifications may get stuck:", this.state.notifications);
    }
    this.timeout = clearInterval(this.timeout);
  }

  /**
   * Called at regular intervals to update the notifications.
   */
  interval() {
    console.log("tick....")
    this.setState(s => ({
      notifications: s.notifications
        .map(n => ({ ...n, elapsed: n.elapsed + TICK_INTERVAL }))
        .filter(n => !n.timeout || n.elapsed <= n.timeout)
    }), this.maybeEndTimer);
  }

  push({ _id, title, icon, type, timeout, canClose, children }) {
    this.setState(s => ({
      notifications: [
        ...s.notifications,
        { _id: _id || uuid(), elapsed: 0, title, icon, type, timeout, children, canClose }
      ]
    }), this.maybeStartTimer);
  }

  close(id) {
    this.setState(s => ({
      notifications: s.notifications.filter(n => n._id != id)
    }), this.maybeEndTimer);
  }

  render() {
    return (<Context.Provider value={{
      notifications: this.state.notifications,
      push: this.push,
      close: this.close
    }}>
      {this.props.children}
    </Context.Provider>)
  }
}

Context.Consumer.name = "notificationStore";
export default Context.Consumer;
