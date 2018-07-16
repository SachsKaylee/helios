import React from "react";
import Card from "../../components/Card";
import Form from "../../components/Form";
import A from "../../components/A";
import config from "../../config/client";
import { FormattedMessage } from "react-intl";
import Store from "../../store";
import { LoginIcon, LogoutIcon, EarthIcon, DeleteIcon, ContentSaveIcon, ErrorOutlineIcon } from "mdi-react";
import { formatBytes } from "../../bytes";

export default class Account extends React.Component {
  constructor(p) {
    super(p);
  }

  getTitle() {
    return (<FormattedMessage id="account.title" />);
  }

  render() {
    return (<Store.Consumer>
      {store => store && store.session
        ? this.renderLogOut(store)
        : this.renderLogIn(store)}
    </Store.Consumer>);
  }

  renderLogIn(store) {
    return (<Card>
      <Form
        submitText={(<span>
          <LoginIcon className="mdi-icon-spacer" />
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
        ]} />
    </Card>);
  }

  renderLogOut(store) {
    const { session } = store;
    const { id, permissions, avatar } = session;
    return (<Card
      title={<FormattedMessage id="account.welcome" values={{ id }} />}
      subtitle={<span><FormattedMessage id="account.permissions" /> {permissions.length
        ? permissions.map(p => (<span className="tag" style={{ marginRight: 2 }} key={p}>{p}</span>))
        : <FormattedMessage id="none" />}</span>}
      image={avatar || `/api/avatar/${id}`}>
      <div>
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
          <LogoutIcon className="mdi-icon-spacer" />
          <FormattedMessage id="account.signOut" />
        </a>
        <A className="margin-2 button is-link" href={`/about/${id}`}>
          <EarthIcon className="mdi-icon-spacer" />
          <FormattedMessage id="account.viewPublic" />
        </A>
        <a className="margin-2 button is-danger">
          <DeleteIcon className="mdi-icon-spacer" />
          <FormattedMessage id="account.delete" />
        </a>
      </div>
    </Card>);
  }

  renderUpdateForm(store) {
    const { session } = store;
    return (<Form
      className="margin-2"
      data={{ ...session, avatar: undefined }}
      submitText={(<span>
        <ContentSaveIcon className="mdi-icon-spacer" />
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
            message: (<FormattedMessage id="account.avatar.errorTooLarge" values={{
              isSize: formatBytes(avatar.size),
              maxSize: formatBytes(config.maxAvatarSize)
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
            <ErrorOutlineIcon className="mdi-icon-spacer" />
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