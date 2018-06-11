import React from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";
import Card from "../../components/Card";
import config from "../../config/client";
import A from "../../components/A";
import { get } from "axios";
import async from "../../async";

export default class Admin extends React.Component {
  static getInitialProps() {
    return async.all({
      post: get("/api/post-count"),
      user: get("/api/user-count")
    }).then(({ post, user }) => ({
      postCount: post.data.count,
      userCount: user.data.count
    }));
  }

  getTitle() {
    return (<FormattedMessage id="admin.title" />);
  }

  render() {
    const { postCount, userCount } = this.props;
    return (<Card title={config.title} subtitle={config.description}>
      <nav className="level">
        <div className="level-item has-text-centered">
          <div>
            <p className="heading"><A href="/"><FormattedMessage id="admin.posts" /></A></p>
            <p className="title"><FormattedNumber value={postCount} /></p>
          </div>
        </div>
        <div className="level-item has-text-centered">
          <div>
            <p className="heading"><A href="/admin/users"><FormattedMessage id="admin.users" /></A></p>
            <p className="title"><FormattedNumber value={userCount} /></p>
          </div>
        </div>
      </nav>
    </Card>);
  }
}