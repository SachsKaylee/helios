import React from "react";
import Card from "../../components/layout/Card";
import { FormattedMessage, injectIntl } from "react-intl";
import { get, post, put } from "axios";
import Router from "next/router";
import { SlimError } from "../../components/Error";
import CreateUserForm from "../../components/forms/CreateUserForm";
import crossuser from "../../utils/crossuser";

export default injectIntl(class User extends React.Component {
  static getInitialProps({ query, req }) {
    const { id } = query;
    return id
      ? get(`/api/user/${id}`, crossuser(req))
        .then(({ data }) => ({ isNew: false, user: data }))
        .catch(error => ({ error }))
      : { isNew: true };
  }

  blobToFile(blob) {
    const type = blob && this.blobType(blob);
    return {
      name: blob ? "avatar." + type : "",
      type: blob ? "image/" + type : "",
      data: blob,
      size: blob ? blob.length : 0
    };
  }

  blobType(blob) {
    const data = blob.split(",")[0].split(";")[0];
    return data.substr("data:image/".length);
  }

  submitCreate = ({ id, password, bio, avatar, permissions }) => {
    return post("/api/user", { id, password, bio, permissions, avatar: avatar ? avatar.data : "" })
      .then(this.goBack)
      .catch(error => ({
        id: {
          error: true,
          message: (<SlimError error={error.response.data} />)
        }
      }));
  }

  submitUpdate = ({ password, bio, avatar, permissions }) => {
    const { id } = this.props.user;
    return put(`/api/user/${id}`, { password, bio, permissions, avatar: avatar ? avatar.data : "" })
      .then(this.goBack)
      .catch(error => ({
        id: {
          error: true,
          message: (<SlimError error={error.response.data} />)
        }
      }));
  }

  goBack = () => {
    Router.push("/admin/users")
  }

  componentDidMount() {
    const { isNew } = this.props;
    const title = this.props.intl.formatMessage({ id: isNew ? "users.createUser" : "users.updateUser" });
    this.props.setPageTitle(title);
  }

  render() {
    const { isNew, user } = this.props;
    return (
      <div className="container">
        <Card
          image={this.avatarOf(user)}
          title={isNew ? (<FormattedMessage id="users.createUser" />) : (<FormattedMessage id="users.updateUser" />)}
          subtitle={!isNew && user && (<FormattedMessage id="users.updateUserSubtitle" values={{ id: user.id }} />)}>
          <CreateUserForm
            onSubmit={isNew ? this.submitCreate : this.submitUpdate}
            onCancel={this.goBack}
            isCreating={isNew}
            data={isNew ? {} : { ...user, bio: user.bio, avatar: this.blobToFile(user.avatar) }} />
        </Card>
      </div>);
  }

  avatarOf(user) {
    if (!user) return undefined;
    if (user.avatar) return user.avatar;
    return `/api/avatar/${user.id}`;
  }
});
