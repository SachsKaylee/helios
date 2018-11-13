import SidebarLayout from "../../components/SidebarLayout";
import A from "../../components/A";
import React from "react";
import Card from "../../components/Card"
import EditablePost from "../../components/Post/PostEditor";
import axios from "axios";
import NotificationProvider from "../../components/NotificationProvider"
import { FormattedMessage, injectIntl } from "react-intl";
import config from "../../config/client";
import { DeleteIcon, WarningIcon, LoadingIcon, ErrorIcon, CakeIcon } from "mdi-react";
import { SlimError, FullError } from "../../components/Error";
import PostForm from "../../components/pages/admin/post/PostForm";

export default injectIntl(class PostPage extends React.PureComponent {
  constructor(p) {
    super(p);
    this.notifications = React.createRef();
    this.editorRef = React.createRef();
    this.state = {
      state: "loading"
    };
  }

  static async getInitialProps({ query: { id } }) {
    return { id };
  }

  componentDidMount() {
    let title = "";
    const { state } = this.state;
    switch (state) {
      case "loaded": {
        title = isNew
          ? this.props.intl.formatMessage({ id: "post.title.new" }, { title })
          : this.props.intl.formatMessage({ id: "post.title.edit" }, { title })
        break;
      }
      case "loading": {
        title = this.props.intl.formatMessage({ id: "loading" });
        break;
      }
      case "error": {
        title = this.props.intl.formatMessage({ id: "error" });
        break;
      }
    }
    this.props.setPageTitle(title);
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

  stateFromData = ({ _id, date, author, title, content, tags, notes }, oldState) => {
    return {
      id: _id,
      isNew: !_id,
      author, tags, notes,
      date: date ? new Date(date) : new Date(),
      title: title,
      content: content
    }
  }

  onChange = what => (value) => {
    this.setState({ [what]: value });
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

  onPublish = ({ tags, notes }) => {
    const { id, title, content, date, author, isNew } = this.state;
    const data = {
      author, date, tags, notes,
      title: title,
      content: content
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
    return (<div>
      <p className="subtitle">
        <ErrorIcon className="mdi-icon-spacer" />
        <FormattedMessage id="error" />
      </p>
      <SlimError error={error} />
    </div>);
  }

  renderLoading() {
    // todo: spinner
    return (<Card title={(<p><FormattedMessage id="loading" /></p>)}>
      <LoadingIcon className="mdi-icon-titanic" />
    </Card>);
  }

  renderError() {
    const { error } = this.state;
    return (<FullError error={error} />);
  }

  renderLoaded() {
    const { title, content, isNew, date, author, tags, notes } = this.state;
    return (
      <div className="container">
        <SidebarLayout size={3} sidebar={(
          <div className="sidebar">
            <Card>
              <PostForm 
                tags={tags}
                notes={notes}
                allTags={["helios", "react", "javascript"]}
                onPublish={this.onPublish}
                onDelete={!isNew && (this.onDelete(false))}
              />
              <NotificationProvider ref={ref => this.notifications = ref} />
            </Card>
          </div>)}>
          <EditablePost
            author={author}
            avatar={`/api/avatar/${author}`}
            content={content}
            date={date}
            title={title}
            editorRef={this.editorRef}
            onChange={this.onChange}
          />
        </SidebarLayout>
      </div>
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
});

const defaultPostData = () => ({
  tags: config.defaultTags,
  title: config.locale.post.defaults.title,
  content: config.locale.post.defaults.description
});
