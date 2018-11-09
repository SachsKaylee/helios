import React from "react";
import { get, post, put } from "axios";

const Context = React.createContext();

export class SessionProvider extends React.PureComponent {
  constructor(p) {
    super(p);
    this.state = {
      session: undefined
    };
  }

  componentDidMount() {
    get("/api/session")
      .then(({ data }) => this.setState({ session: data }))
      .catch(() => this.setState({ session: undefined }));
  }

  signIn = ({ id, password }) => new Promise((res, rej) =>
    post("/api/session/login", { id, password })
      .then(({ data }) => this.setState({ session: data }, res))
      .catch(error => rej(error.response.data)));

  signOut = () => new Promise((res, rej) =>
    post("/api/session/logout")
      .then(() => this.setState({ session: undefined }, res))
      .catch(error => rej(error.response.data)));

  updateProfile = ({ password, passwordNew, avatar, bio }) => new Promise((res, rej) =>
    put("/api/session", { password, passwordNew, avatar, bio })
      .then(({ data }) => this.setState({ session: data }, res))
      .catch(error => rej(error.response.data)));

  setSession = (session) => {
    this.setState({ session });
  }

  hasPermission = (perm) => {
    const { session } = this.state;
    return session && (
      session.permissions.indexOf("admin") !== -1 ||
      session.permissions.indexOf(perm) !== -1)
  }

  render() {
    return (<Context.Provider value={{
      session: this.state.value,
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
export default Context.Consumer;
