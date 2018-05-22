import React from "react";
import { get, post } from "axios";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import Form from "../../components/Form";

export default class Account extends React.Component {
  static async getInitialProps(p) {
    try {
      const session = await get("/api/session");
      return { session };
    }
    catch (_) {
      return { session: undefined };
    }
  }

  onSubmit = values => {
    post("/api/login", values)
      .then(console.log)
      .catch(console.error)
  };

  render() {
    const { session } = this.props;
    return (<Layout title="Log In">
      {session ? this.renderLogOut() : this.renderLogIn()}
    </Layout>)
  }

  renderLogIn() {
    return (<Card compactY>
      <Form
        submitText="Sign In"
        onSubmit={this.onSubmit}
        elements={[
          {
            key: "id",
            type: "text",
            name: "Username",
            validator: (name) => ({ error: name.startsWith("@"), message: "Your name doesn't start with @" }),
            placeholder: "🙃 @your-name-here"
          },
          {
            key: "password",
            type: "text",
            name: "Password",
            mode: "password",
            ignoreData: true,
            placeholder: "🔑 Not 123!"
          }
        ]} />
    </Card>);
  }

  renderLogOut() {
    const { session } = this.props;
    return session.id;
  }
};