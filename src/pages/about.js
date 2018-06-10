import React from "react";
import PageRoot from "../components/PageRoot";
import config from "../config/client";
import axios from "axios";
import Head from "next/head";
import Tag from "../components/Tag";
import Card from "../components/Card";
import PostMedia from "../components/PostMedia";
import { render, defaultRules } from "../slate-renderer";
import { FormattedMessage } from "react-intl";
import LatestPosts from "../components/LatestPosts";

class About extends React.Component {
  static getInitialProps({ query: { id } }) {
    // If the user did not specify an ID we will get the default user.
    return axios.get(id ? `/api/user/${id}` : "/api/user")
      .then(({ data: user }) => ({ user, error: false }))
      .catch((error) => ({ error: error.response.data }));
  }

  renderUser() {
    const { user: { id, permissions, bio }, posts } = this.props;
    // We need a canonical URL since the ID of the user can be inferred by accessing 
    // the /about page, which resolved to the default user.
    return (<PageRoot title={<FormattedMessage id="about.title" values={{ id }} />}>
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
            {bio && render(defaultRules, bio)}
            <p className="content is-small"><FormattedMessage id="about.permissions" /> {permissions.length
              ? permissions.map(p => (<Tag key={p}>{p}</Tag>))
              : <FormattedMessage id="none" />}</p>
          </div>
        </div>

        <h2 className="subtitle">
          <FormattedMessage id="about.recentPosts" />
        </h2>
        
        <LatestPosts limit={3} byUser={id} />

      </Card>
    </PageRoot>);
  }

  renderError() {
    // todo: implement a proper error rendering component
    // todo: implement a better translation of mongo errors on server side
    const { error } = this.props;
    return (<PageRoot title={<FormattedMessage id="error" />}>
      {JSON.stringify(error)}
    </PageRoot>);
  }

  render() {
    const { error } = this.props;
    return error ? this.renderError() : this.renderUser();
  }
}

export default About;