import React from "react";
import PageRoot from "../../components/PageRoot";
import { FormattedMessage } from "react-intl";
import Card from "../../components/Card";
import config from "../../config/client";
import LatestPosts from "../../components/LatestPosts";
import A from "../../components/A";
import { get } from "axios";

export default class Admin extends React.Component {
  componentDidMount() {

  }

  render() {
    return (<PageRoot title={(<FormattedMessage id="admin.title" />)}>
      <Card title={config.title} subtitle={config.description}>
        <nav className="level">
          <div className="level-item has-text-centered">
            <div>
              <p className="heading"><A href="/"><FormattedMessage id="admin.posts" /></A></p>
              <p className="title">3,456</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading"><A href="/admin/users"><FormattedMessage id="admin.users" /></A></p>
              <p className="title">4</p>
            </div>
          </div>
        </nav>
      </Card>
    </PageRoot>);
  }
}