import Posts from "../components/post/PostList";
import React from "react";
import axios from "axios";
import config, { locale } from "../config/client";
import Head from "next/head";
import A from "../components/system/A";
import { FormattedMessage } from "react-intl";

export default class IndexPage extends React.PureComponent {
  static async getInitialProps({ query }) {
    const [posts, postCount] = await Promise.all([
      axios.get("/api/post", {
        params: {
          skip: query.page && ((parseInt(query.page, 10) - 1) * config.postsPerPage), limit: config.postsPerPage
        }
      }),
      axios.get("/api/post-count")
    ]);
    return {
      count: postCount.data.count,
      page: query.page ? parseInt(query.page, 10) : 1,
      // We do not create the Value here, but instead in render since it was throwing an error with SSR
      posts: posts.data.map(({ _id, author, date, title, content, tags, notes }) => ({
        id: _id,
        title: title,
        content: content,
        date,tags, notes, author
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
    const endThisPage = page * config.postsPerPage;
    const totalPages = Math.ceil(count / config.postsPerPage);
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/`} />
      </Head>
      <div className="container">
        <Posts posts={posts.map(p => ({
          ...p,
          date: new Date(p.date)
        }))} />
      </div>
      <div className="container" style={{ marginTop: 16 }}>
        <nav className="pagination" role="navigation" aria-label="pagination">
          {page !== 1 && (<A className="pagination-previous" href={"?page=" + (page - 1)}><FormattedMessage id="navigation.previousPage" /></A>)}
          {endThisPage < count && (<A className="pagination-next" href={"?page=" + (page + 1)}><FormattedMessage id="navigation.nextPage" /></A>)}
          <ul className="pagination-list">
            {page > 1 && (<li>
              <A className="pagination-link" aria-label="#1" href={"?page=1"}>1</A>
            </li>)}
            {page > 2 && (<>
              <li>
                <span className="pagination-ellipsis">&hellip;</span>
              </li>
              <li>
                <A className="pagination-link" aria-label={"#" + (page - 1)} href={"?page=" + (page - 1)}>{page - 1}</A>
              </li>
            </>)}
            <li>
              <a className="pagination-link is-current" aria-label={"#" + page} aria-current="page" href="#">{page}</a>
            </li>
            {page < totalPages && (<li>
              <A className="pagination-link" aria-label={"#" + (page + 1)} href={"?page=" + (page + 1)}>{page + 1}</A>
            </li>)}
            {page + 1 < totalPages && (<><li>
              <span className="pagination-ellipsis">&hellip;</span>
            </li>
              <li>
                <A className="pagination-link" aria-label={"#" + totalPages} href={"?page=" + totalPages}>{totalPages}</A>
              </li></>)}
          </ul>
        </nav>
      </div>
    </>);
  }
};