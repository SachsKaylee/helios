import Post from "../components/Post";
import React from "react"
import axios from "axios"
import Head from "next/head";
import config from "../config/client";
import Store from "../store";

export default class extends React.Component {
  static async getInitialProps(p) {
    const { data } = await axios.get("/api/post/" + p.query.id);
    return { post: data };
  }

  getTitle() {
    return this.post.title;
  }

  render() {
    const { post } = this.props;
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/post/${post._id}`} />
        <meta key="author" name="author" content={post.author} />
        <meta key="description" name="description" content={post.title} />
      </Head>
      <Store.Consumer>
        {store => (<Post
          edit={[store && store.hasPermission("author") && "show-admin-buttons"]}
          id={post._id}
          date={new Date(post.date)}
          author={post.author}
          title={post.title}
          content={post.content} />)}
      </Store.Consumer>
    </>);
  }
};