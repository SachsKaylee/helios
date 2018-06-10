import React from "react";
import PageRoot from "../../components/PageRoot";
import Card from "../../components/Card";
import config from "../../config/client";
import Form from "../../components/Form";
import { FormattedMessage } from "react-intl";
import { get, post, put } from "axios";
import Icon, { icons } from "../../components/Icon";

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

  submitCreate = ({ id, password, bio, avatar }) => {
    return post("/api/user", { id, password, bio, avatar: avatar ? avatar.data : "" })
      .then(({ data }) => this.setState({ isNew: false, user: data }))
      .catch(error => ({ error: "ERROR TODO" })); // todo: error
  }

  submitUpdate = ({ password, bio, avatar }) => {
    const { id } = this.props.user;
    return put(`/api/user/${id}`, { password, bio, avatar: avatar ? avatar.data : "" })
      .then(({ data }) => this.setState({ user: data }))
      .catch(error => ({ error: "ERROR TODO" })); // todo: error
  }

  render() {
    const { isNew, user } = this.props;
    const title = isNew ? (<FormattedMessage id="users.createUser" />) : (<FormattedMessage id="users.updateUser" />);
    return (<PageRoot title={title}>
      <Card
        image={this.avatarOf(user)}
        title={title}
        subtitle={!isNew && user && (<FormattedMessage id="users.updateUserSubtitle" values={{ id: user.id }} />)}>
        {isNew
          ? (<CreateForm onSubmit={this.submitCreate} />)
          : (<UpdateForm onSubmit={this.submitUpdate} data={{ ...user, avatar: this.blobToFile(user.avatar) }} />)}
      </Card>
    </PageRoot>);
  }

  avatarOf(user) {
    if (!user) return undefined;
    if (user.avatar) return user.avatar;
    return `/api/avatar/${user.id}`;
  }
}

// todo: permissions!

const baseElements = () => [
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
    validator: (v, d) => ({
      error: v !== d.password,
      message: (<FormattedMessage id="account.changePassword.mismatchError" />)
    })
  }
];
const newElements = () => [
  {
    key: "id",
    type: "text",
    name: (<FormattedMessage id="username" />),
    placeholder: (<FormattedMessage id="username" />)
  },
  ...baseElements()
];
const editElements = () => [
  ...baseElements()
];

const CreateForm = ({ onSubmit }) => (<Form
  elements={newElements()}
  submitText={(<span>
    <Icon style={{ marginRight: 2 }}>{icons.save}</Icon>
    <FormattedMessage id="users.createUser" />
  </span>)}
  onSubmit={onSubmit} />);
const UpdateForm = ({ onSubmit, data }) => (<Form
  elements={editElements()}
  submitText={(<span>
    <Icon style={{ marginRight: 2 }}>{icons.save}</Icon>
    <FormattedMessage id="users.updateUser" />
  </span>)}
  onSubmit={onSubmit}
  data={data} />);
