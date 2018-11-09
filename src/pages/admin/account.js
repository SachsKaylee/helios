import React from "react";
import Card from "../../components/Card";
import A from "../../components/A";
import { FormattedMessage, injectIntl } from "react-intl";
import Session from "../../store/Session";
import { LogoutIcon, EarthIcon, DeleteIcon } from "mdi-react";
import LogInForm from "../../components/pages/admin/account/LogInForm";
import EditProfileForm from "../../components/pages/admin/account/EditProfileForm";

export default injectIntl(class Account extends React.Component {
  constructor(p) {
    super(p);
  }

  getTitle() {
    return this.props.intl.formatMessage({ id: "account.title" });
  }

  render() {
    return (
      <div className="container">
        <Session>
          {session => session && session.user
            ? this.renderLogOut(session)
            : this.renderLogIn(session)}
        </Session>
      </div>);
  }

  renderLogIn(session) {
    return (
      <Card>
        <LogInForm onSubmit={values => session
          .signIn(values)
          .then(() => ({}))
          .catch(error => errorToMessage(error))} />
      </Card>);
  }

  renderLogOut(session) {
    const { id, permissions, avatar } = session.user;
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
        {this.renderUpdateForm(session)}
        <h2 className="subtitle">
          <FormattedMessage id="actions" />
        </h2>
        <a className="margin-2 button is-primary" onClick={() => session.signOut()
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

  renderUpdateForm(session) {
    return <EditProfileForm data={{ ...session.user, avatar: undefined }}
      onSubmit={values => store.actions.updateProfile({
        password: values.password,
        passwordNew: values.passwordNew,
        avatar: values.avatar.data,
        bio: values.bio
      }).then(() => ({}))
        .catch(error => errorToMessage(error))} />
  }
});

const errorToMessage = error => {
  switch (error) {
    case "no-data": return { id: { error: true, message: "No user with this name could be found!" } };
    case "incorrect-password": return { password: { error: true, message: "Good news: The username is correct! Bad news: The password isn't..." } };
    default: return { id: { error: true, message: error } };
  }
}
