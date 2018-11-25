import Posts from "../components/post/PostList";
import React from "react";
import axios from "axios";
import config, { locale } from "../config/client";
import Head from "next/head";
import Pagination from "../components/layout/Pagination";
import crossuser from "../utils/crossuser";

export default class IndexPage extends React.PureComponent {
  static async getInitialProps({ query, req }) {
    const [posts, postCount] = await Promise.all([
      axios.get("/api/post", crossuser(req, {
        params: {
          skip: query.page && ((parseInt(query.page, 10) - 1) * config.postsPerPage), limit: config.postsPerPage
        }
      })),
      axios.get("/api/post-count", crossuser(req))
    ]);
    return {
      count: postCount.data.count,
      page: query.page ? parseInt(query.page, 10) : 1,
      posts: posts.data.map(({ _id, author, date, title, content, tags, notes }) => ({
        id: _id,
        title: title,
        content: content,
        date, tags, notes, author
      })).sort((a, b) => {
        const keyA = new Date(a.date);
        const keyB = new Date(b.date);
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      })
    };
  }

  componentDidMount() {
    this.props.setPageTitle(locale.pages.blog.title);
  }

  render() {
    const { posts, count, page } = this.props;
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/`} />
      </Head>
      <Pagination perPage={config.postsPerPage} count={count} page={page}>
        <Posts posts={posts.map(p => ({
          ...p,
          date: new Date(p.date)
        }))} />
      </Pagination>
    </>);
  }
};
