
import Posts from "../components/post/PostList";
import React from "react";
import axios from "axios";
import config from "../config/client";
import Head from "next/head";
import Pagination from "../components/layout/Pagination";
import { injectIntl } from "react-intl";
import crossuser from "../utils/crossuser";

export default injectIntl(class TagPage extends React.PureComponent {
  static async getInitialProps({ query, req }) {
    const tag = query.tag || config.defaultTags[0];
    const [posts, postCount] = await Promise.all([
      axios.get(`/api/tag/posts/${encodeURIComponent(tag)}`, crossuser(req, {
        params: {
          skip: query.page && ((parseInt(query.page, 10) - 1) * config.postsPerPage), limit: config.postsPerPage
        }
      })),
      axios.get(`/api/tag/count/${encodeURIComponent(tag)}`, crossuser(req))
    ]);
    return {
      tag: tag,
      count: postCount.data.count,
      page: query.page ? parseInt(query.page, 10) : 1,
      posts: posts.data.sort((a, b) => {
        const keyA = new Date(a.date);
        const keyB = new Date(b.date);
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      })
    };
  }

  componentDidMount() {
    const title = this.props.intl.formatMessage({ id: "tag.title" }, { tag: this.props.tag });
    this.props.setPageTitle(title);
  }

  render() {
    const { posts, count, page, tag } = this.props;
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/tag/${encodeURIComponent(tag)}`} />
      </Head>
      <Pagination perPage={config.postsPerPage} count={count} page={page}>
        <Posts posts={posts.map(p => ({
          ...p,
          date: new Date(p.date)
        }))} />
      </Pagination>
    </>);
  }
});
