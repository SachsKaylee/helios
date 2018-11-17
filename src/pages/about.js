import React from "react";
import config from "../config/client";
import axios from "axios";
import Head from "next/head";
import Card from "../components/layout/Card";
import { FormattedMessage, injectIntl } from "react-intl";
import { FullError } from "../components/Error";
import PostMedia from "../components/post/PostMedia";
import Session from "../store/Session";
import A from "../components/system/A";

export default injectIntl(class AboutPage extends React.Component {
  static getInitialProps({ query: { id } }) {
    return Promise.all([
      axios.get(id ? `/api/user/${id}` : "/api/user"),
      axios.get(id ? `/api/posts-of/${id}` : "/api/posts-of", { params: { limit: config.postsPerAboutPage } })
    ]).then(([userData, postData]) => ({ user: userData.data, latestPosts: postData.data }))
      .catch(error => ({ error: error.response.data }));
  }

  componentDidMount() {
    const title = this.props.intl.formatMessage({ id: "about.title" }, { id: this.props.user.id });
    this.props.setPageTitle(title);
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

            <p className="content is-small"><FormattedMessage id="about.permissions" /> {permissions.length
              ? permissions.map(p => (<span className="tag" key={p}>{p}</span>))
                : <FormattedMessage id="none" />}
                <br/>
            </p>

            <div dangerouslySetInnerHTML={{ __html: bio }}/>

            <Session>
              {session => {
                if (session.user && session.user.id === id) {
                  return (<A className="button" href={`/admin/account`}>
                    <FormattedMessage id="account.updateProfile" />
                  </A>);
                } else if (session.hasPermission("admin")) {
                  return (<A className="button" href={`/admin/user/${id}`}>
                    <FormattedMessage id="users.updateUser" />
                  </A>);
                } else {
                  return null;
                }
              }}
            </Session>
          </div>
        </div>

        <h2 className="subtitle">
          <FormattedMessage id="about.recentPosts" />
        </h2>

        {latestPosts.map(post => (<PostMedia key={post._id} {...post} />))}
      </Card>
    </>);
  }

  render() {
    const { error } = this.props;
    return (<div className="container">{error ?
      (<FullError error={error} />)
      : this.renderUser()
    }</div>);
  }
});
