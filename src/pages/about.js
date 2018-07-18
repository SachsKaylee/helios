import React from "react";
import config from "../config/client";
import axios from "axios";
import Head from "next/head";
import Card from "../components/Card";
import { Renderer, postRules } from "../slate-renderer";
import { FormattedMessage } from "react-intl";
import { FullError } from "../components/Error";
import PostMedia from "../components/Post/PostMedia";

const rules = postRules();

class About extends React.Component {
  static getInitialProps({ query: { id } }) {
    return Promise.all([
      axios.get(id ? `/api/user/${id}` : "/api/user"),
      axios.get(id ? `/api/posts-of/${id}` : "/api/post", { params: { limit: 3 } })
    ]).then(([userData, postData]) => ({ user: userData.data, latestPosts: postData.data }))
      .catch(error => ({ error: error.response.data }));
  }

  getTitle() {
    const { error, user } = this.props;
    return error
      ? (<FormattedMessage id="error" />)
      : (<FormattedMessage id="about.title" values={{ id: user.id }} />);
  }

  renderUser() {
    const { user: { id, permissions, bio }, latestPosts } = this.props;
    // We need a canonical URL since the ID of the user can be inferred by accessing 
    // the /about page, which resolved to the default user.
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/about/${id}`} />
        <meta key="author" name="author" content={id} />
      </Head>
      <Card>
        <div className="media">
          <div className="media-left">
            <figure className="image is-64x64">
              <img src={`/api/avatar/${id}`} />
            </figure>
          </div>
          <div className="media-content">
            <h1 className="title">
              <FormattedMessage id="about.title" values={{ id }} />
            </h1>
            {bio && (<Renderer rules={rules}>{bio}</Renderer>)}
            <p className="content is-small"><FormattedMessage id="about.permissions" /> {permissions.length
              ? permissions.map(p => (<span className="tag" key={p}>{p}</span>))
              : <FormattedMessage id="none" />}</p>
          </div>
        </div>

        <h2 className="subtitle">
          <FormattedMessage id="about.recentPosts" />
        </h2>

        {latestPosts.map(post => (<PostMedia key={post.id} {...post} />))}
      </Card>
    </>);
  }

  render() {
    // todo: implement a better translation of mongo errors on server side
    const { error } = this.props;
    return error ?
      (<FullError error={error} />)
      : this.renderUser();
  }
}

export default About;