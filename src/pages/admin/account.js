import React from "react";
import Card from "../../components/layout/Card";
import { FormattedMessage, injectIntl } from "react-intl";
import Session from "../../store/Session";
import LogoutIcon from "mdi-react/LogoutIcon";
import EarthIcon from "mdi-react/EarthIcon";
import LogInForm from "../../components/forms/LogInForm";
import EditProfileForm from "../../components/forms/EditProfileForm";
import { Router } from "../../routes";

export default injectIntl(class Account extends React.Component {
  componentDidMount() {
    const title = this.props.intl.formatMessage({ id: "account.title" });
    this.props.setPageTitle(title);
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
      </div>
    </Card>);
  }

  renderUpdateForm(session) {
    return <EditProfileForm
      data={{ ...session.user, avatar: undefined }}
      buttons={[
        {
          key: "signOut",
          action: () => session.signOut().catch(error => errorToMessage(error)),
          name: (<span>
            <LogoutIcon className="mdi-icon-spacer" />
            <FormattedMessage id="account.signOut" />
          </span>)
        },
        {
          key: "viewPublic",
          action: () => Router.pushRoute(`/about/${session.user.id}`),
          name: (<span>
            <EarthIcon className="mdi-icon-spacer" />
            <FormattedMessage id="account.viewPublic" />
          </span>),
          type: "link"
        },
        /*{
          key: "delete",
          name: (<span>
            <DeleteIcon className="mdi-icon-spacer" />
            <FormattedMessage id="account.delete" />
          </span>),
          type: "danger"
        }*/
      ]}
      onSubmit={values => session.updateProfile({
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
