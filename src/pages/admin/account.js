import React from "react";
import PageRoot from "../../components/PageRoot";
import Card from "../../components/Card";
import Form from "../../components/Form";
import A from "../../components/A";
import SidebarLayout from "../../components/SidebarLayout";
import Tag from "../../components/Tag";
import NotificationProvider from "../../components/NotificationProvider";
import Icon, { icons } from "../../components/Icon";
import config from "../../config/client";
import { FormattedMessage } from "react-intl";
import Store from "../../store";

export default class Account extends React.Component {
  constructor(p) {
    super(p);
  }

  render() {
    return (<PageRoot title={<FormattedMessage id="account.title" />}>
      <Card>{this.renderContent()}</Card>
    </PageRoot>)
  }

  renderContent() {
    return (<Store.Consumer>
      {store => store.session
        ? this.renderLogOut(store)
        : this.renderLogIn(store)}
    </Store.Consumer>);
  }

  renderLogIn(store) {
    return (<Form
      submitText={(<span>
        <Icon>{icons.signIn}</Icon>
        <FormattedMessage id="account.signIn" />
      </span>)}
      onSubmit={values => store.actions
        .signIn(values)
        .then(session => ({}))
        .catch(error => errorToMessage(error))}
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

  renderLogOut(store) {
    const { session } = store;
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
      {this.renderUpdateForm(store)}
      <h2 className="subtitle">
        <FormattedMessage id="actions" />
      </h2>
      <a className="margin-2 button is-primary" onClick={() => store.actions.signOut()
        .then(() => ({}))
        .catch(error => errorToMessage(error))}>
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

  renderUpdateForm(store) {
    const { session } = store;
    return (<Form
      className="margin-2"
      data={{ ...session, avatar: undefined }}
      submitText={(<span>
        <Icon>{icons.save}</Icon>
        <FormattedMessage id="save" />
      </span>)}
      onSubmit={values => store.actions.updateProfile({
        password: values.password,
        passwordNew: values.passwordNew,
        avatar: values.avatar.data,
        bio: values.bio
      }).then(() => ({}))
        .catch(error => errorToMessage(error))}
      elements={[
        {
          key: "avatar",
          type: "file",
          name: (<FormattedMessage id="account.avatar.field" />),
          validator: avatar => ({
            error: avatar.size > config.maxAvatarSize,
            // todo: better byte size formatter
            message: (<FormattedMessage id="account.avatar.errorTooLarge" values={{
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