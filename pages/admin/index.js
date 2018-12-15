import React from "react";
import BookOpenPageVariantIcon from "mdi-react/BookOpenPageVariantIcon";
import AccountsIcon from "mdi-react/AccountsIcon";
import EmailIcon from "mdi-react/EmailIcon";
import RssFeedIcon from "mdi-react/RssFeedIcon";
import { FormattedMessage, FormattedNumber, injectIntl } from "react-intl";
import Card from "../../components/layout/Card";
import config from "../../config/client";
import A from "../../components/system/A";
import { get } from "axios";
import crossuser from "../../utils/crossuser";

export default injectIntl(class Admin extends React.Component {
  static getInitialProps({ req }) {
    const opts = crossuser(req);
    return Promise
      .all([
        get("/api/post-count", opts), 
        get("/api/user-count", opts), 
        get("/api/page-count", opts), 
        get("/api/subscription/count", opts)
      ])
      .then(([post, user, page, subscription]) => ({
        postCount: post.data.count,
        userCount: user.data.count,
        pageCount: page.data.count,
        subscriptionCount: subscription.data.count
      }));
  }

  componentDidMount() {
    const title = this.props.intl.formatMessage({ id: "admin.title" });
    this.props.setPageTitle(title);
  }

  render() {
    const { postCount, userCount, pageCount, subscriptionCount } = this.props;
    return (
      <div className="container">
        <Card title={config.title} subtitle={config.description}>
          <nav className="level">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading"><A href="/"><EmailIcon /> <FormattedMessage id="admin.posts" /></A></p>
                <p className="title"><FormattedNumber value={postCount} /></p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading"><A href="/admin/pages"><BookOpenPageVariantIcon /> <FormattedMessage id="admin.pages" /></A></p>
                <p className="title"><FormattedNumber value={pageCount} /></p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading"><A href="/admin/users"><AccountsIcon /> <FormattedMessage id="admin.users" /></A></p>
                <p className="title"><FormattedNumber value={userCount} /></p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading"><A href="/admin/subscribers"><RssFeedIcon /> <FormattedMessage id="admin.subscribers" /></A></p>
                <p className="title"><FormattedNumber value={subscriptionCount} /></p>
              </div>
            </div>
          </nav>
        </Card>
      </div>);
  }
});