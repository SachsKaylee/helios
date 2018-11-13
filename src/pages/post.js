import Post from "../components/Post";
import React from "react"
import axios from "axios"
import Head from "next/head";
import config from "../config/client";
import Session from "../store/Session";

export default class PostPage extends React.PureComponent {
  static async getInitialProps(p) {
    const { data } = await axios.get("/api/post/" + p.query.id);
    return { post: data };
  }
  
  componentDidMount() {
    this.props.setPageTitle(this.props.post.title);
  }

  render() {
    const { post } = this.props;
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/post/${post._id}`} />
        <meta key="author" name="author" content={post.author} />
        <meta key="description" name="description" content={post.title} />
      </Head>
      <div className="container">
        <Session>
          {session => (<Post
            {...post}
            edit={[session && session.hasPermission("author") && "show-admin-buttons"]}
            id={post._id}
            date={new Date(post.date)} />)}
        </Session>
      </div>
    </>);
  }
};