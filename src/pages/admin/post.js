import Layout from "../../components/Layout";
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
      <p className="subtitle"><Icon>{icons.trash}</Icon> Post deleted!</p>
      <p>The post has been <strong>deleted</strong>. The contents of the post will remain in the editor in case you wish to re-publish it.</p>
    </div>);
  }

  renderDeleteConfirmNotification() {
    return (<div>
      <p className="subtitle"><Icon>{icons.exclamation}</Icon> Are you sure?</p>
      <p>You are about to delete the post. This action is permanent and <strong>cannot be undone</strong>.</p>
      <p><a onClick={this.onDelete(true)}>Fine by me, delete it!</a></p>
    </div>);
  }

  renderPublishSuccessNotification(data) {
    return (<div>
      <p className="subtitle"><Icon>{icons.cake}</Icon> Published!</p>
      <p>The post <A href={`/post/${data._id}`}>{data.title}</A> has been published!</p>
    </div>);
  }

  renderErrorNotification(error) {
    return (<div>
      <p className="subtitle"><Icon>{icons.exclamation}</Icon> Error!</p>
      <p>An error occurred! Below you can see some details, be sure to pass it to a developer robot!</p>
      <p><code>{JSON.stringify(error)}</code></p>
    </div>);
  }

  renderLoading() {
    return (<Layout title="Post: Loading...">
      <Card compactY title={(<p>Loading Editor ...</p>)} ><Icon spin size="4x">{icons.spinner}</Icon></Card>
    </Layout>);
  }

  renderError() {
    const { error } = this.state;
    return (<Layout title="Post: Error!">
      <Card compactY title={(<p>Error!</p>)} >
        <p><code>{JSON.stringify(error)}</code></p>
      </Card>
    </Layout>);
  }

  renderLoaded() {
    const { id, title, content, isNew, date, author, lastChanged } = this.state;
    return (
      <Layout title={`Post: ${isNew ? `Composing...` : id}`}>
        <SidebarLayout size={3} sidebar={<Card compactX compactY>
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
            avatar={`/static/content/avatars/${author}.png`}
            content={content}
            date={date}
            id={id}
            title={title}
            onChange={this.onChange(true)}
          />
        </SidebarLayout>
      </Layout>
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
  title: "New Post ...",
  content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
});

// issue: Slate Editor Mode cannot be used with SSR
// https://github.com/ianstormtaylor/slate/issues/870
// A user claims that it works, but for me the "onChange" events were not triggered. Also the toolbar did nothing.
/*const DynamicPost = dynamic(import("../../components/Post"), {
  loading: () => (<Card title={(<p>⏳ Loading Editor ⌛</p>)} />), // todo: put this in a card!
  ssr: false
});*/