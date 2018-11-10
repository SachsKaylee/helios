import React from "react";
import Card from "../../components/Card";
import { FormattedMessage } from "react-intl";
import { get, post, put } from "axios";
import Router from "next/router";
import { SlimError } from "../../components/Error";
import CreateUserForm from "../../components/pages/admin/user/CreateUserForm";
import { dataToValue } from "../../components/EditorRichText";

export default class User extends React.Component {
  static getInitialProps(p) {
    const { id } = p.query;
    return id
      ? get(`/api/user/${id}`)
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

  getTitle() {
    const { isNew } = this.props;
    return isNew ? (<FormattedMessage id="users.createUser" />) : (<FormattedMessage id="users.updateUser" />);
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
            data={isNew ? {} : { ...user, bio: dataToValue(user.bio), avatar: this.blobToFile(user.avatar) }} />
        </Card>
      </div>);
  }

  avatarOf(user) {
    if (!user) return undefined;
    if (user.avatar) return user.avatar;
    return `/api/avatar/${user.id}`;
  }
}
