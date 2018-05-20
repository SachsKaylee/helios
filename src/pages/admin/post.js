import Layout from "../../components/Layout";
import SidebarLayout from "../../components/SidebarLayout";
import EditorToolbar from "../../components/EditorToolbar";
import A from "../../components/A";
import { uuid } from "../../uuid";
import { Value } from "slate";
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
      const { data } = await axios.get("/api/post/" + p.query.id);
      return { post: data };
    } else {
      return {
        post: {
          author: "you", // todo: author
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
      title: this.toValue(title),
      content: this.toValue(content)
    }
  }

  toValue(value) {
    return "string" === (typeof value)
      ? Plain.deserialize(value)
      : Value.isValue(value)
        ? value
        : Value.fromJSON(value);
  }

  onChange = changedFocus => what => ({ value }) => {
    console.log("change", what, value)
    this.setState(changedFocus
      ? { [what]: value, lastChanged: what }
      : { [what]: value });
  }

  onSave = () => {
    const { id, title, content, date, author, isNew } = this.state;
    const data = {
      author, date,
      title: Plain.serialize(title),
      content: content.toJSON()
    };
    (isNew
      ? axios.post("/api/post", data)
      : axios.put("/api/post/" + id, data)).then(({ data }) => {
        this.setState(this.stateFromData(data, this.state), () => {
          this.notifications.push({
            canClose: true,
            type: "success",
            children: this.renderPostNotification({ data })
          });
        });
      });
  }

  renderPostNotification({ error, data }) {
    if (error) {
      return "ok"
    } else {
      return (<div>
        <p className="subtitle">🎂 Published!</p>
        <p>The post <A href={`/post/${data._id}`}>{data.title}</A> has been published!</p>
      </div>);
    }
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
            onSave={this.onSave} />
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