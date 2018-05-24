import React from "react";
import { get, post, put } from "axios";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Form from "../../components/Form";
import A from "../../components/A";
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

  onSubmit = values => {
    return new Promise((res, rej) => {
      post("/api/session/login", values)
        .then(({ data }) => {
          this.notifications.push({
            type: "success",
            canClose: true,
            children: "🔑 You were signed in."
          });
          this.setState({ session: data });
          res();
        })
        .catch(error => {
          console.error("log in error", error.response.data);
          rej(errorToMessage(error.response.data));
        });
    });
  }

  onSignOut = () => {
    post("/api/session/logout")
      .then(() => {
        this.notifications.push({
          type: "success",
          canClose: true,
          children: "🔑 You were signed out."
        });
        this.setState({ session: "none" });
      })
      .catch(console.error);
  }

  onSubmitProfile = values => {
    const newData = {
      password: values.password,
      passwordNew: values.passwordNew,
      avatar: values.avatar.data
    };
    return new Promise((res, rej) => {
      put("/api/session", newData)
        .then(({ data }) => {
          this.notifications.push({
            type: "success",
            canClose: true,
            children: "💾 Your profile has been updated."
          });
          this.setState({ session: data });
          res();
        })
        .catch(error => {
          console.error("save profile error", error.response.data);
          rej(errorToMessage(error.response.data));
        });
    });
  }

  render() {
    return (<Layout title="Account">
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
      <div className="media">
        <div className="media-left">
          <figure className="image is-64x64">
            <img src={`/static/content/avatars/${id}.png`} />
          </figure>
        </div>
        <div className="media-content">
          <h1 className="title">Welcome, {id}!</h1>
          <p>You have the following permissions: {permissions.length ? permissions.map(p => (<Tag key={p}>{p}</Tag>)) : "none"}</p>
        </div>
      </div>
      <div className="media">
        <div className="media-content">
          <h2 className="subtitle">Update profile</h2>
          {this.renderUpdateForm()}
        </div>
      </div>
      <div className="media">
        <div className="media-content">
          <h2 className="subtitle">Actions</h2>
          <a className="button is-primary" onClick={this.onSignOut}>🔑 Sign Out</a>
          <A className="button is-link" href={`/about/${id}`}>👁️ View Public Profile</A>
          <a className="button is-danger">🔥 Delete Account</a>
        </div>
      </div>
    </div>);
  }

  renderUpdateForm() {
    return (<Form
      submitText={(<span><i className="fas fa-save"/> Save</span>)}
      onSubmit={this.onSubmitProfile}
      elements={[
        {
          key: "avatar",
          type: "file",
          name: "Change Avatar",
          validator: avatar => ({ error: avatar.size > 200 * 1024, message: "The avatar may not be larger than 200KiB." })
        },
        {
          key: "passwordNew",
          type: "text",
          name: "Change Password",
          mode: "password",
          ignoreData: true,
          placeholder: "🔑 Your new password (optional)"
        },
        {
          key: "passwordNewConfirm",
          type: "text",
          name: "Change Password (Confirm)",
          mode: "password",
          ignoreData: true,
          placeholder: "🔑 Confirm your new password (optional)",
          validator: (v, d) => ({ error: v !== d.passwordNew, message: "The two passwords are different." })
        },
        {
          key: "password",
          type: "text",
          name: (<span><i className="fas fa-exclamation" /> Enter your current Password to confirm</span>),
          mode: "password",
          ignoreData: true,
          placeholder: "🔑 Your old password (required)",
          validator: pw => ({ error: !pw, message: "Enter your password to confirm." })
        }
      ]} />);
  }
};

const errorToMessage = error => {
  switch (error) {
    case "no-data": return { id: { error: true, message: "No user with this name could be found!" } };
    case "incorrect-password": return { password: { error: true, message: "Good news: The username is correct! Bad news: The password isn't..." } };
    default: return { id: { error: true, message: error } };
  }
}