import React from "react";
import { get, post, put } from "axios";

const Context = React.createContext();

export class SessionProvider extends React.PureComponent {
  constructor(p) {
    super(p);
    this.state = {
      session: null
    };
  }

  componentDidMount() {
    get("/api/session")
      .then(({ data }) => this.setSession(data))
      .catch(() => this.setSession(undefined));
  }

  signIn = ({ id, password }) => new Promise((res, rej) =>
    post("/api/session/login", { id, password })
      .then(({ data }) => this.setSession(data, res))
      .catch(error => rej(error.response.data)));

  signOut = () => new Promise((res, rej) =>
    post("/api/session/logout")
      .then(() => this.setSession(null, res))
      .catch(error => rej(error.response.data)));

  updateProfile = ({ password, passwordNew, avatar, bio }) => new Promise((res, rej) =>
    put("/api/session", { password, passwordNew, avatar, bio })
      .then(({ data }) => this.setSession(data, res))
      .catch(error => rej(error.response.data)));

  setSession = (session, callback) => {
    if (session === undefined || session === null) {
      this.setState({ session: null }, callback);
    } else {
      this.setState({ session }, callback);
    }
  }

  hasPermission = (perm) => {
    const { session } = this.state;
    return session && (
      session.permissions.indexOf("admin") !== -1 ||
      session.permissions.indexOf(perm) !== -1)
  }

  render() {
    return (<Context.Provider value={{
      user: this.state.session,
      hasPermission: this.hasPermission,
      setSession: this.setSession,
      signIn: this.signIn,
      signOut: this.signOut,
      updateProfile: this.updateProfile
    }}>
      {this.props.children}
    </Context.Provider>)
  }
}

Context.Consumer.name = "sessionStore";
export default Context.Consumer;
