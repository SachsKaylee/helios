import SidebarLayout from "../../components/SidebarLayout";
import EditorToolbar from "../../components/EditorToolbar";
import A from "../../components/A";
import { Value } from "slate";
import Plain from 'slate-plain-serializer';
import React from "react";
import Card from "../../components/Card"
import EditablePost from "../../components/EditablePost";
import axios from "axios";
import NotificationProvider from "../../components/NotificationProvider"
import { FormattedMessage } from "react-intl";
import config from "../../config/client";
import { DeleteIcon, WarningIcon, LoadingIcon, ErrorIcon, CakeIcon, PublishIcon, FileUndoIcon } from "mdi-react";

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

  getTitle() {
    const { state } = this.state;
    switch (state) {
      case "loaded": return isNew
        ? (<FormattedMessage id="post.title.new" values={{ title: this.valueToString(title) }} />)
        : (<FormattedMessage id="post.title.edit" values={{ title: this.valueToString(title) }} />);
      case "loading": return (<FormattedMessage id="loading" />);
      case "error": return (<FormattedMessage id="error" />);
    }
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
          type: "danger",
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
        <DeleteIcon className="mdi-icon-spacer" />
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
        <WarningIcon className="mdi-icon-spacer" />
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
        <CakeIcon className="mdi-icon-spacer" />
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
        <ErrorIcon className="mdi-icon-spacer" />
        <FormattedMessage id="error" />
      </p>
      <p>
        <FormattedMessage id="errorMessages.generic" />
      </p>
      <p><code>{JSON.stringify(error)}</code></p>
    </div>);
  }

  renderLoading() {
    // todo: spinner
    return (<Card title={(<p><FormattedMessage id="loading" /></p>)}>
      <LoadingIcon className="mdi-icon-titanic" />
    </Card>);
  }

  renderError() {
    // todo: error renderer
    const { error } = this.state;
    return (<Card title={(<p><FormattedMessage id="error" /></p>)} >
      <p>
        <FormattedMessage id="errorMessages.generic" />
      </p>
      <p>
        <code>{JSON.stringify(error)}</code>
      </p>
    </Card>);
  }

  renderLoaded() {
    const { title, content, isNew, date, author, lastChanged } = this.state;
    return (
      <SidebarLayout size={3} sidebar={<Card>
        <EditorToolbar
          stylesChooser={lastChanged === "content"}
          value={content}
          onChange={this.onChange(false)("content")}
          buttons={[
            {
              key: "publish",
              type: "is-primary",
              text: (<><PublishIcon className="mdi-icon-spacer" /> <FormattedMessage id="publish" /></>),
              action: this.onPublish
            },
            {
              key: "publish",
              type: "is-danger",
              text: (<><FileUndoIcon className="mdi-icon-spacer" /> <FormattedMessage id="discard" /></>)
            },
            !isNew && {
              key: "delete",
              type: "is-danger",
              text: (<><DeleteIcon className="mdi-icon-spacer" /> <FormattedMessage id="delete" /></>),
              action: this.onDelete(false)
            }
          ]} />
        <NotificationProvider ref={ref => this.notifications = ref} />
      </Card>}>
        <EditablePost
          author={author}
          avatar={`/api/avatar/${author}`}
          content={content}
          date={date}
          title={title}
          onChange={this.onChange(true)}
        />
      </SidebarLayout>
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