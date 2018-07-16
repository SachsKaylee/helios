import React from "react";
import Card from "../../components/Card";
import config from "../../config/client";
import Form from "../../components/Form";
import { FormattedMessage } from "react-intl";
import { get, post, put } from "axios";
import Router from "next/router";
import { ContentSaveIcon } from "mdi-react";
import { SlimError } from "../../components/Error";
import { formatBytes } from "../../bytes";

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
      size: blob.length
    };
  }

  blobType(blob) {
    const data = blob.split(",")[0].split(";")[0];
    return data.substr("data:image/".length);
  }

  submitCreate = ({ id, password, bio, avatar, permissions }) => {
    return post("/api/user", { id, password, bio, permissions, avatar: avatar ? avatar.data : "" })
      .then(() => Router.push("/admin/users"))
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
      .then(() => Router.push("/admin/users"))
      .catch(error => ({
        id: {
          error: true,
          message: (<SlimError error={error.response.data} />)
        }
      }));
  }

  getTitle() {
    const { isNew } = this.props;
    return isNew ? (<FormattedMessage id="users.createUser" />) : (<FormattedMessage id="users.updateUser" />);
  }

  render() {
    const { isNew, user } = this.props;
    return (<Card
      image={this.avatarOf(user)}
      title={isNew ? (<FormattedMessage id="users.createUser" />) : (<FormattedMessage id="users.updateUser" />)}
      subtitle={!isNew && user && (<FormattedMessage id="users.updateUserSubtitle" values={{ id: user.id }} />)}>
      {isNew
        ? (<CreateForm onSubmit={this.submitCreate} />)
        : (<UpdateForm onSubmit={this.submitUpdate} data={{ ...user, avatar: this.blobToFile(user.avatar) }} />)}
    </Card>);
  }

  avatarOf(user) {
    if (!user) return undefined;
    if (user.avatar) return user.avatar;
    return `/api/avatar/${user.id}`;
  }
}

const baseElements = () => [
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
    key: "permissions",
    name: "Permissions",
    type: "taglist",
    tags: {
      author: "author"
    }
  }
];
const newElements = () => [
  {
    key: "id",
    type: "text",
    name: (<FormattedMessage id="username" />),
    placeholder: (<FormattedMessage id="username" />)
  },
  ...baseElements(),
  {
    key: "password",
    type: "text",
    name: (<FormattedMessage id="password" />),
    mode: "password",
    ignoreData: true,
    placeholder: (<FormattedMessage id="users.password.placeholder" />),
    validator: v => ({
      error: !v,
      message: (<FormattedMessage id="formValueRequired" values={{ field: <FormattedMessage id="password" /> }} />)
    })
  },
  {
    key: "passwordConfirm",
    type: "text",
    name: (<FormattedMessage id="users.password.confirm" />),
    mode: "password",
    ignoreData: true,
    placeholder: (<FormattedMessage id="users.password.placeholder" />),
    validator: (passwordConfirm, { password }) => ({
      error: passwordConfirm !== password,
      message: (<FormattedMessage id="account.changePassword.mismatchError" />)
    })
  }
];
const editElements = () => [
  ...baseElements(),
  {
    key: "password",
    type: "text",
    name: (<FormattedMessage id="account.changePassword.field1" />),
    mode: "password",
    ignoreData: true,
    placeholder: (<FormattedMessage id="users.password.placeholder" />)
  },
  {
    key: "passwordConfirm",
    type: "text",
    name: (<FormattedMessage id="account.changePassword.field2" />),
    mode: "password",
    ignoreData: true,
    placeholder: (<FormattedMessage id="users.password.placeholder" />),
    validator: (passwordConfirm, { password }) => ({
      error: passwordConfirm !== password,
      message: (<FormattedMessage id="account.changePassword.mismatchError" />)
    })
  }
];

const CreateForm = ({ onSubmit }) => (<Form
  elements={newElements()}
  submitText={(<span>
    <ContentSaveIcon className="mdi-icon-spacer" />
    <FormattedMessage id="users.createUser" />
  </span>)}
  onSubmit={onSubmit} />);
const UpdateForm = ({ onSubmit, data }) => (<Form
  elements={editElements()}
  submitText={(<span>
    <ContentSaveIcon className="mdi-icon-spacer" />
    <FormattedMessage id="users.updateUser" />
  </span>)}
  onSubmit={onSubmit}
  data={data} />);
