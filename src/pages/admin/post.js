import Layout from "../../components/Layout";
import SidebarLayout from "../../components/SidebarLayout";
import EditorToolbar from "../../components/EditorToolbar";
import { uuid } from "../../uuid";
import lorem from "lorem-ipsum";
import Plain from 'slate-plain-serializer';
import React from "react";
import Card from "../../components/Card"
import dynamic from 'next/dynamic'
import axios from "axios";

export default class extends React.PureComponent {
  constructor(p) {
    super(p);
    const { url: { query: { id: id } } } = p;
    this.state = {
      title: Plain.deserialize("New Post ..."),
      content: Plain.deserialize("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."),
      id: id,
      date: new Date(),
      isNew: !id,
      lastChanged: "content"
    }
  }

  onChange = changedFocus => what => ({ value }) => {
    console.log("change", what, value)
    this.setState(changedFocus
      ? { [what]: value, lastChanged: what }
      : { [what]: value });
  }

  onSave = () => {
    const { id, title, content, date, isNew } = this.state;
    const data = {
      author: "You", // todo: author
      date,
      title: Plain.serialize(title),
      content: content.toJSON()
    };
    isNew
      ? axios.post("/api/post", data)
      : axios.put("/api/post/" + id, data);
  }

  render() {
    const { id, title, content, isNew, date, lastChanged } = this.state;
    console.log("render", { id, title, isNew, date, lastChanged, title: title !== undefined, content: content !== undefined })
    return (
      <Layout title={`Post: ${isNew ? id : `Composing...`}`}>
        <SidebarLayout size={3} sidebar={<Card compactX>
          <EditorToolbar
            stylesChooser={lastChanged === "content"}
            value={content}
            onChange={this.onChange(false)("content")}
            onSave={this.onSave} />
        </Card>}>
          <DynamicPost
            allowEdit
            author="patrick-sachs"// todo: read user id cookie and then get user
            avatar="http://www.radfaces.com/images/avatars/wednesday-addams.jpg"
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