import Layout from "../../components/Layout";
import SidebarLayout from "../../components/SidebarLayout";
import EditorToolbar from "../../components/EditorToolbar";
import A from "../../components/A";
import { uuid } from "../../uuid";
import { Value } from "slate";
import fp from "../../fp";
import lorem from "lorem-ipsum";
import Plain from 'slate-plain-serializer';
import React from "react";
import Card from "../../components/Card"
import dynamic from 'next/dynamic'
import axios from "axios";
import NotificationProvider from "../../components/NotificationProvider"

export default class extends React.PureComponent {
  constructor(p) {
    super(p);
    this.notifications = React.createRef();
    this.state = this.stateFromData(p.post);
  }

  static async getInitialProps(p) {
    if (p.query.id) {
      const { data } = await axios.get(`/api/post/${p.query.id}`);
      return { post: data };
    } else {
      const { data } = await axios.get("/api/session");
      return {
        post: {
          author: data._id, // todo: author
          title: "New Post ...",
          content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
        }
      };
    }
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
      <p className="subtitle">☠️ Post deleted!</p>
      <p>The post has been <strong>deleted</strong>. The contents of the post will remain in the editor in case you wish to re-publish it.</p>
    </div>);
  }

  renderDeleteConfirmNotification() {
    return (<div>
      <p className="subtitle">🔥 Are you sure?</p>
      <p>You are about to delete the post. This action is permanent and <strong>cannot be undone</strong>.</p>
      <p><a onClick={this.onDelete(true)}>Fine by me, delete it!</a></p>
    </div>);
  }

  renderPublishSuccessNotification(data) {
    return (<div>
      <p className="subtitle">🎂 Published!</p>
      <p>The post <A href={`/post/${data._id}`}>{data.title}</A> has been published!</p>
    </div>);
  }

  renderErrorNotification(error) {
    return (<div>
      <p className="subtitle">🤖 Error!</p>
      <p>An error occurred! Below you can see some details, be sure to pass it to a developer robot!</p>
      <p><code>{JSON.stringify(error)}</code></p>
    </div>);
  }

  render() {
    const { id, title, content, isNew, date, author, lastChanged } = this.state;
    return (
      <Layout title={`Post: ${isNew ? id : `Composing...`}`}>
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
          <DynamicPost
            edit={["allow-content-editing"]}
            author={author}
            avatar={`/static/content/avatars/${author}.png`}
            content={content}
            date={date}
            id={id}
            title={title}
            onChange={this.onChange(true)}
          />
          <Card compactY>
            <p>Last changed: {lastChanged}</p>
            <code style={{ color: "black" }}>
              {JSON.stringify(this.state[lastChanged].toJSON())}
            </code>
          </Card>
        </SidebarLayout>
      </Layout>
    );
  }
}

// issue: Slate Editor Mode cannot be used with SSR
// https://github.com/ianstormtaylor/slate/issues/870
// A user claims that it works, but for me the "onChange" events were not triggered. Also the toolbar did nothing.
const DynamicPost = dynamic(import("../../components/Post"), {
  loading: () => (<Card title={(<p>⏳ Loading Editor ⌛</p>)} />), // todo: put this in a card!
  ssr: false
});