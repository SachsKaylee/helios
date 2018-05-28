import React from "react";
import Layout from "../components/Layout";
import config from "../config/client";
import axios from "axios";
import Head from "next/head";
import Tag from "../components/Tag";
import Card from "../components/Card";

class About extends React.Component {
  static getInitialProps({ query: { id } }) {
    return new Promise((res, rej) => {
      // If the user did not specify an ID we will get the default user.
      axios.get(id ? `/api/user/${id}` : "/api/user")
        .then(({ data }) => res({ user: data, error: false }))
        .catch(( data ) => res({ error: data, error: true }));
    });
  }

  renderUser() {
    const { user: { id, permissions } } = this.props;
    // We need a canonical URL since the ID of the user can be inferred by accessing 
    // the /about page, which resolved to the default user.
    return (<Layout title={`About ${id}`}>
      <Head>
        <link key="canonical" rel="canonical" href={`https://${config.domains[0]}:${config.port.https}/about/${id}`} />
        <meta key="author" name="author" content={id} />
      </Head>
      <Card>
        <div className="media">
          <div className="media-left">
            <figure className="image is-64x64">
              <img src={`/static/content/avatars/${id}.png`} />
            </figure>
          </div>
          <div className="media-content">
            <h1 className="title">{id}</h1>
            <p>This user has the following permissions: {permissions.length ? permissions.map(p => (<Tag key={p}>{p}</Tag>)) : "none"}</p>
          </div>
        </div>
      </Card>
    </Layout>);
  }

  renderError() {
    // todo: implement a proper error rendering component
    // todo: implement a better translation of mongo errors on server side
    return (<Layout title="Error">
      error :(
    </Layout>);
  }

  render() {
    const { error } = this.props;
    return error ? this.renderError() : this.renderUser();
  }
}

export default About;