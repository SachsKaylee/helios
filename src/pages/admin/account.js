import React from "react";
import { get, post, put } from "axios";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Form from "../../components/Form";
import A from "../../components/A";
import SidebarLayout from "../../components/SidebarLayout";
import Tag from "../../components/Tag";
import NotificationProvider from "../../components/NotificationProvider";
import Icon, { icons } from "../../components/Icon";
import config from "../../config/client";
import { FormattedMessage } from "react-intl";

export default class Account extends React.Component {
  constructor(p) {
    super(p);
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
        .then(({ data }) => this.setState({ session: data }, () => res()))
        .catch(error => {
          console.error("log in error", error && error.response && error.response.data);
          rej(errorToMessage(error.response.data));
        });
    });
  }

  onSignOut = () => {
    post("/api/session/logout")
      .then(() => this.setState({ session: "none" }))
      .catch(console.error);
  }

  onSubmitProfile = values => {
    const newData = {
      password: values.password,
      passwordNew: values.passwordNew,
      avatar: values.avatar.data,
      bio: values.bio
    };
    return new Promise((res, rej) => {
      put("/api/session", newData)
        .then(({ data }) => {
          this.notifications.push({
            type: "success",
            canClose: true,
            children: (<span>
              <Icon>{icons.user}</Icon>
              <FormattedMessage id="account.notification.updatedProfile.title" />
            </span>)
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
    return (<Layout title={<FormattedMessage id="account.title" />}>
      <Card>{this.renderContent()}</Card>
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

  renderLogIn() {
    return (<Form
      submitText={(<span>
        <Icon>{icons.signIn}</Icon>
        <FormattedMessage id="account.signIn" />
      </span>)}
      onSubmit={this.onSubmit}
      elements={[
        {
          key: "id",
          type: "text",
          name: <FormattedMessage id="username" />,
          validator: (name) => ({
            error: !name,
            message: <FormattedMessage id="formValueRequired" values={{
              field: <FormattedMessage id="username" />
            }} />
          }),
          placeholder: <FormattedMessage id="account.usernamePlaceholder" />
        },
        {
          key: "password",
          type: "text",
          name: <FormattedMessage id="password" />,
          mode: "password",
          ignoreData: true,
          validator: (pw) => ({
            error: !pw,
            message: <FormattedMessage id="formValueRequired" values={{
              field: <FormattedMessage id="password" />
            }} />
          }),
          placeholder: <FormattedMessage id="account.passwordPlaceholder" />
        },
        {
          key: "cookie",
          type: "checkbox",
          name: <FormattedMessage id="account.acceptCookie" />,
          validator: (cookie) => ({
            error: !cookie,
            message: <FormattedMessage id="account.cookieRequired" />
          })
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
            <img src={`/api/avatar/${id}`} />
          </figure>
        </div>
        <div className="media-content">
          <h1 className="title"><FormattedMessage id="account.welcome" values={{ id }} /></h1>
          <p><FormattedMessage id="account.permissions" /> {permissions.length
            ? permissions.map(p => (<Tag key={p}>{p}</Tag>))
            : <FormattedMessage id="none" />}</p>
        </div>
      </div>
      <h2 className="subtitle">
        <FormattedMessage id="account.updateProfile" />
      </h2>
      {this.renderUpdateForm()}
      <h2 className="subtitle">
        <FormattedMessage id="actions" />
      </h2>
      <a className="margin-2 button is-primary" onClick={this.onSignOut}>
        <Icon>{icons.signOut}</Icon>
        <FormattedMessage id="account.signOut" />
      </a>
      <A className="margin-2 button is-link" href={`/about/${id}`}>
        <Icon>{icons.eye}</Icon>
        <FormattedMessage id="account.viewPublic" />
      </A>
      <a className="margin-2 button is-danger">
        <Icon>{icons.trash}</Icon>
        <FormattedMessage id="account.delete" />
      </a>
    </div>);
  }

  renderUpdateForm() {
    const { session } = this.state;
    return (<Form
      className="margin-2"
      data={session}
      submitText={(<span>
        <Icon>{icons.save}</Icon>
        <FormattedMessage id="save" />
      </span>)}
      onSubmit={this.onSubmitProfile}
      elements={[
        {
          key: "avatar",
          type: "file",
          name: (<FormattedMessage id="account.changeAvatar" />),
          validator: avatar => ({
            error: avatar.size > config.maxAvatarSize,
            // todo: better byte size formatter
            message: (<FormattedMessage id="account.avatarTooLarge" values={{
              isSize: avatar.size + "B",
              maxSize: config.maxAvatarSize + "B"
            }} />)
          })
        },
        {
          key: "bio",
          type: "richtext",
          name: (<FormattedMessage id="account.bio.field" />),
          placeholder: (<FormattedMessage id="account.bio.placeholder" />)
        },
        {
          key: "passwordNew",
          type: "text",
          name: (<FormattedMessage id="account.changePassword.field1" />),
          mode: "password",
          ignoreData: true,
          placeholder: (<FormattedMessage id="account.changePassword.field1Placeholder" />)
        },
        {
          key: "passwordNewConfirm",
          type: "text",
          name: (<FormattedMessage id="account.changePassword.field2" />),
          mode: "password",
          ignoreData: true,
          placeholder: (<FormattedMessage id="account.changePassword.field2Placeholder" />),
          validator: (v, d) => ({
            error: v !== d.passwordNew,
            message: (<FormattedMessage id="account.changePassword.mismatchError" />)
          })
        },
        {
          key: "password",
          type: "text",
          name: (<span>
            <Icon>{icons.exclamation}</Icon>
            <FormattedMessage id="account.confirmPassword.field" />
          </span>),
          mode: "password",
          ignoreData: true,
          placeholder: <FormattedMessage id="account.confirmPassword.placeholder" />,
          validator: pw => ({
            error: !pw,
            message: <FormattedMessage id="formValueRequired" values={{
              field: <FormattedMessage id="account.confirmPassword.field" />
            }} />
          })
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