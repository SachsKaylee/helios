import React from "react";
import { uuid } from "../utils/uuid";

const Context = React.createContext();

export class NotificationProvider extends React.PureComponent {
  constructor(p) {
    super(p);
    this.notifications = React.createRef();
    this.push = this.push.bind(this);
    this.close = this.close.bind(this);
    this.state = {
      notifications: []
    };
  }

  push({ _id = uuid(), title, icon, type, canClose, children }) {
    this.setState(s => ({
      notifications: [
        ...s.notifications,
        { _id, type, children, canClose }
      ]
    }));
  }

  close(id) {
    this.setState(s => ({
      notifications: s.notifications.filter(n => n._id != id)
    }));
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
