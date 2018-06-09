import PageRoot from "../../components/PageRoot";
import SidebarLayout from "../../components/SidebarLayout";
import EditorToolbar from "../../components/EditorToolbar";
import A from "../../components/A";
import { Value } from "slate";
import fp from "../../fp";
import Plain from 'slate-plain-serializer';
import React from "react";
import Card from "../../components/Card"
import Post from "../../components/Post";
import dynamic from 'next/dynamic'
import axios from "axios";
import NotificationProvider from "../../components/NotificationProvider"
import Icon, { icons } from "../../components/Icon";
import { FormattedMessage } from "react-intl";
import config from "../../config/client";

export default class extends React.PureComponent {
  constructor(p) {
    super(p);
    this.notifications = React.createRef();
    this.state = {
      state: "loading"
    };
  }

  static async getInitialProps({ query: { id } }) {
    return { id };
  }

  componentDidMount() {
    const { id } = this.props;
    id
      ? axios.get(`/api/post/${id}`)
        .then(({ data }) => this.setState({ ...this.stateFromData(data), state: "loaded" }))
        .catch((data) => this.setState({ error: data, state: "error" }))
      : axios.get("/api/session")
        .then(({ data }) => this.setState({ ...this.stateFromData({ ...defaultPostData(), author: data.id, }), state: "loaded" }))
        .catch((data) => this.setState({ error: data, state: "error" }));
  }

  stateFromData = ({ _id, date, author, title, content }, oldState) => {
    return {
      id: _id,
      isNew: !_id,
      author,
      lastChanged: (oldState && oldState.lastChanged) || "content",
      date: date ? new Date(date) : new Date(),
      title: this.dataToValue(title),
      content: this.dataToValue(content)
    }
  }

  dataToValue(value) {
    return "string" === (typeof value)
      ? Plain.deserialize(value)
      : Value.isValue(value)
        ? value
        : Value.fromJSON(value);
  }

  valueToString(value) {
    return "string" === (typeof value)
      ? value
      : Value.isValue(value)
        ? Plain.serialize(value)
        : "" + value;
  }

  onChange = changedFocus => what => ({ value }) => {
    this.setState(changedFocus
      ? { [what]: value, lastChanged: what }
      : { [what]: value });
  }

  onDelete = (really) => () => {
    if (really) {
      const { id } = this.state;
      axios.delete(`/api/post/${id}`).then(() => {
        this.setState({
          id: undefined,
          isNew: true,
          date: new Date()
        }, () => {
          this.notifications.push({
            canClose: true,
            type: "success",
            children: this.renderDeleteSuccessNotification()
          });
        });
      }).catch(error => {
        this.notifications.push({
          canClose: true,
          type: "error",
          children: this.renderErrorNotification({ error })
        });
      });
    } else {
      this.notifications.push({
        canClose: true,
        type: "danger",
        children: this.renderDeleteConfirmNotification()
      });
    }
  }

  onPublish = () => {
    const { id, title, content, date, author, isNew } = this.state;
    const data = {
      author, date,
      title: this.valueToString(title),
      content: content.toJSON()
    };
    (isNew
      ? axios.post("/api/post", data)
      : axios.put(`/api/post/${id}`, data)).then(({ data }) => {
        this.setState(this.stateFromData(data, this.state), () => {
          this.notifications.push({
            canClose: true,
            type: "success",
            children: this.renderPublishSuccessNotification(data)
          });
        });
      }).catch(error => {
        this.notifications.push({
          canClose: true,
          type: "error",
          children: this.renderErrorNotification({ error })
        });
      });
  }

  renderDeleteSuccessNotification() {
    return (<div>
      <p className="subtitle">
        <Icon>{icons.trash}</Icon>
        <FormattedMessage id="post.editor.notification.deleted.title" />
      </p>
      <p>
        <FormattedMessage id="post.editor.notification.deleted.description" />
      </p>
    </div>);
  }

  renderDeleteConfirmNotification() {
    return (<div>
      <p className="subtitle">
        <Icon>{icons.exclamation}</Icon>
        <FormattedMessage id="post.editor.notification.delete.title" />
      </p>
      <p>
        <FormattedMessage id="post.editor.notification.delete.description" />
      </p>
      <p><a onClick={this.onDelete(true)}>
        <FormattedMessage id="post.editor.notification.delete.confirm" />
      </a></p>
    </div>);
  }

  renderPublishSuccessNotification(data) {
    const { title, _id: id } = data;
    const args = {
      link: (<A href={`/post/${id}`}>{title}</A>)
    };
    return (<div>
      <p className="subtitle">
        <Icon>{icons.cake}</Icon>
        <FormattedMessage id="post.editor.notification.published.title" values={args} />
      </p>
      <p>
        <FormattedMessage id="post.editor.notification.published.description" values={args} />
      </p>
    </div>);
  }

  renderErrorNotification(error) {
    // todo: error renderer
    return (<div>
      <p className="subtitle">
        <Icon>{icons.exclamation}</Icon>
        <FormattedMessage id="error" />
      </p>
      <p>
        <FormattedMessage id="errorMessages.generic" />
      </p>
      <p><code>{JSON.stringify(error)}</code></p>
    </div>);
  }

  renderLoading() {
    return (<PageRoot title={<FormattedMessage id="loading" />}>
      <Card title={(<p><FormattedMessage id="loading" /></p>)}>
        <Icon spin size="4x">{icons.spinner}</Icon></Card>
    </PageRoot>);
  }

  renderError() {
    // todo: error renderer
    const { error } = this.state;
    return (<PageRoot title={<FormattedMessage id="error" />}>
      <Card title={(<p><FormattedMessage id="error" /></p>)} >
        <p>
          <FormattedMessage id="errorMessages.generic" />
        </p>
        <p><code>{JSON.stringify(error)}</code></p>
      </Card>
    </PageRoot>);
  }

  renderLoaded() {
    const { id, title, content, isNew, date, author, lastChanged } = this.state;
    const titleComponent = isNew
      ? <FormattedMessage id="post.title.new" values={{ title: this.valueToString(title) }} />
      : <FormattedMessage id="post.title.edit" values={{ title: this.valueToString(title) }} />;
    return (
      <PageRoot title={titleComponent}>
        <SidebarLayout size={3} sidebar={<Card>
          <EditorToolbar
            stylesChooser={lastChanged === "content"}
            value={content}
            onChange={this.onChange(false)("content")}
            onSave={this.onPublish}
            onDelete={this.onDelete(false)}
            buttons={{
              publish: true,
              discard: true,
              delete: !isNew
            }} />
          <NotificationProvider ref={ref => this.notifications = ref} />
        </Card>}>
          <Post
            edit={["allow-content-editing"]}
            author={author}
            avatar={`/api/avatar/${author}`}
            content={content}
            date={date}
            id={id}
            title={title}
            onChange={this.onChange(true)}
          />
        </SidebarLayout>
      </PageRoot>
    );
  }

  render() {
    const { state } = this.state;
    switch (state) {
      case "loaded": return this.renderLoaded();
      case "loading": return this.renderLoading();
      case "error": return this.renderError();
    }
  }
}

const defaultPostData = () => ({
  title: config.locale.post.defaults.title,
  content: config.locale.post.defaults.description
});