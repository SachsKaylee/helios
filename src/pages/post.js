import Layout from "../components/Layout";
import SidebarLayout from "../components/SidebarLayout";
import Post from "../components/Post";
import lorem from "lorem-ipsum";
import Card from "../components/Card"
import React from "react"
import axios from "axios"
import { Value } from 'slate'

export default class extends React.Component {
  static async getInitialProps(p) {
    const { data } = await axios.get("http://localhost:3000/api/post/" + p.query.id);
    return { post: data };
  }

  render() {
    const { post } = this.props;
    // todo: add title to page name
    return (<Layout title="Blog">
      <Post
        id={post._id}
        date={new Date(post.date)}
        author={post.author}
        title={Value.fromJSON(post.title)}
        content={Value.fromJSON(post.content)} />
    </Layout>);
  }
};