import Posts from "../components/post/PostList";
import React from "react";
import axios from "axios";
import Head from "next/head";
import Pagination from "../components/layout/Pagination";
import crossuser from "../utils/crossuser";
import { injectIntl } from "react-intl";
import { Router } from "../common/routes";

export default injectIntl(class IndexPage extends React.PureComponent {
  static async getInitialProps({ query, req, res, config }) {
    try {
      const userCount  = await axios.get("/api/user-count");
      if (userCount.data.count === 0) {
        if (res) {
          res.writeHead(302, {
            Location: '/setup'
          })
          res.end();
          return {};
        } else {
          Router.push('/setup');
          return {};
        }
      }
    }
    catch (error) {
      console.warn("Failed to check if we need to run the setup ... continuing as normal ...", error);
    }

    try {
      const [{ data: posts }, { data: { count } }] = await Promise.all([
        axios.get("/api/post", crossuser(req, {
          params: {
            skip: query.page && ((parseInt(query.page, 10) - 1) * config.postsPerPage), limit: config.postsPerPage
          }
        })),
        axios.get("/api/post-count", crossuser(req))
      ]);
      return {
        count: count,
        page: query.page ? parseInt(query.page, 10) : 1,
        posts: posts.sort((a, b) => {
          const keyA = new Date(a.date);
          const keyB = new Date(b.date);
          if (keyA < keyB) return 1;
          if (keyA > keyB) return -1;
          return 0;
        })
      };
    }
    catch (error) {
      console.error("Failed to load index", error.message);
      return { count: 0, page: 1, posts: [] };
    }
  }

  componentDidMount() {
    this.props.setPageTitle(this.props.intl.formatMessage({ id: "pages.blog.title" }));
  }

  render() {
    const { posts, count, page, config } = this.props;
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`/`} />
      </Head>
      <Pagination perPage={config.postsPerPage} count={count} page={page}>
        <Posts posts={posts} />
      </Pagination>
    </>);
  }
});
