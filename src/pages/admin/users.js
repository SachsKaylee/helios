import React from "react";
import PageRoot from "../../components/PageRoot";
import { FormattedMessage } from "react-intl";
import Card from "../../components/Card";
import config from "../../config/client";
import LatestPosts from "../../components/LatestPosts";
import A from "../../components/A";
import { get } from "axios";
import Media from "../../components/Media";
import { render, defaultRules } from "../../slate-renderer";

export default class Admin extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      users: []
    }
  }

  componentDidMount() {
    get("/api/users")
      .then(({ data }) => this.setState({ users: data }))
      .catch(console.error);
  }

  render() {
    const { users } = this.state;
    return (<PageRoot title={(<FormattedMessage id="users.title" />)}>
      <Card
        title={(<FormattedMessage id="users.title" />)}
        subtitle={(<span><A className="button" href="/admin/user"><FormattedMessage id="users.createUser" /></A></span>)}>
        {users.map(user => (<Media key={user.id} image={user.avatar || `/api/avatar/${user.id}`} title={(<span>
          <strong style={{ marginRight: 2 }}><A href={`/admin/user/${user.id}`}>{user.id}</A></strong>
          {user.permissions.map(p => (<span className="tag" style={{ marginRight: 2 }} key={p}>{p}</span>))}
        </span>)}>
          {render(defaultRules, user.bio)}
        </Media>))}
      </Card>
    </PageRoot>);
  }
}