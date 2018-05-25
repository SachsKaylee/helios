import Layout from "../components/Layout";
import SidebarLayout from "../components/SidebarLayout";
import Post from "../components/Post";
import Card from "../components/Card"
import React from "react"
import axios from "axios"
import Plain from 'slate-plain-serializer';
import Head from "next/head";
import { Value } from 'slate'

export default class extends React.Component {
  static async getInitialProps(p) {
    const { data } = await axios.get("/api/post/" + p.query.id);
    return { post: data };
  }

  render() {
    const { post, _id } = this.props;
    return (<Layout title={post.title}>
      <Head>
        <link key="canonical" rel="canonical" href={`/post/${_id}`} />
      </Head>
      <Post
        edit={["show-admin-buttons"]}
        id={post._id}
        date={new Date(post.date)}
        author={post.author}
        title={Plain.deserialize(post.title)}
        content={Value.fromJSON(post.content)} />
    </Layout>);
  }
};