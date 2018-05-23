import React from "react";
import { get, post } from "axios";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Form from "../../components/Form";
import SidebarLayout from "../../components/SidebarLayout";
import Tag from "../../components/Tag";
import NotificationProvider from "../../components/NotificationProvider";

export default class Account extends React.Component {
  constructor(p) {
    super(p);
    this.notifications = React.createRef();
    this.state = {
      session: "loading"
    };
  }

  componentDidMount() {
    get("/api/session")
      .then(({ data }) => this.setState({ session: data }))
      .catch(() => this.setState({ session: "none" }));
  }

  onSubmit = async values => {
    return new Promise((res, rej) => {
      post("/api/session/login", values)
        .then(({ data }) => {
          this.notifications.push({
            type: "success",
            canClose: true,
            children: "You were logged in."
          });
          this.setState({ session: data });
          res();
        })
        .catch(error => {
          console.error("log in error", error.response.data);
          rej(errorToMessage(error.response.data));
        })
    })
  };

  onSignOut = () => {
    post("/api/session/logout")
      .then(() => {
        this.notifications.push({
          type: "success",
          canClose: true,
          children: "You were logged out."
        });
        this.setState({ session: "none" })
      })
      .catch(console.error);
  }

  render() {
    return (<Layout title="Log In">
      <SidebarLayout size={3} sidebar={this.renderSidebar()}>
        <Card compactY>{this.renderContent()}</Card>
      </SidebarLayout>
    </Layout>)
  }

  renderContent() {
    const { session } = this.state;
    switch (session) {
      case "loading": return this.renderLoading();
      case "none": return this.renderLogIn();
      default: return this.renderLogOut();
    }
  }

  renderLoading() {
    return ".... LOADING ....";
  }

  renderSidebar() {
    return <Card compactY compactX>
      <p><Tag type="info">Notifications</Tag></p>
      <NotificationProvider ref={n => this.notifications = n} >
        <p>🤘 No notifications!</p>
      </NotificationProvider>
    </Card>
  }

  renderLogIn() {
    return (<Form
      submitText="Sign In"
      onSubmit={this.onSubmit}
      elements={[
        {
          key: "id",
          type: "text",
          name: "Username",
          validator: (name) => ({ error: !name, message: "Please enter your username." }),
          placeholder: "🙃 @your-name-here"
        },
        {
          key: "password",
          type: "text",
          name: "Password",
          mode: "password",
          ignoreData: true,
          validator: (pw) => ({ error: !pw, message: "Please enter your password." }),
          placeholder: "🔑 Not 123!"
        }
      ]} />);
  }

  renderLogOut() {
    const { session } = this.state;
    const { id, permissions } = session;
    return (<div>
      <h1>Welcome, {id}!</h1>
      <p>You have the following permissions: {permissions.length ? permissions.map(p => (<Tag key={p}>{p}</Tag>)) : "none"}</p>
      <a className="button is-primary" onClick={this.onSignOut}>Sign Out</a>
    </div>);
  }
};

const errorToMessage = error => {
  switch (error) {
    case "no-data": return { id: { error: true, message: "No user with this name could be found!" } };
    case "incorrect-password": return { password: { error: true, message: "Good news: The username is correct! Bad news: The password isn't..." } };
    default: return { id: { error: true, message: error } };
  }
}