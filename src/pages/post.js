import Layout from "../components/Layout";
import SidebarLayout from "../components/SidebarLayout";
import Post from "../components/ReadOnlyPost";
import Card from "../components/Card"
import React from "react"
import axios from "axios"
import Plain from 'slate-plain-serializer';
import Head from "next/head";
import config from "../config/client";

export default class extends React.Component {
  static async getInitialProps(p) {
    const { data } = await axios.get("/api/post/" + p.query.id);
    return { post: data };
  }

  render() {
    const { post } = this.props;
    // We use absolute
    return (<Layout title={post.title}>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/post/${post._id}`} />
        <meta key="author" name="author" content={post.author} />
        <meta key="description" name="description" content={post.title} />
      </Head>
      <Post
        edit={["show-admin-buttons"]}
        id={post._id}
        date={new Date(post.date)}
        author={post.author}
        title={post.title}
        content={post.content} />
    </Layout>);
  }
};