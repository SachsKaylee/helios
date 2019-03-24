import React from "react"
import axios from "axios"
import Head from "next/head";
import Session from "../store/Session";
import Page from "../components/page/Page";
import A from "../components/system/A";
import { FormattedMessage, injectIntl } from "react-intl";
import crossuser from "../utils/crossuser";
import { permissions } from "../common/permissions";

export default injectIntl(class PagePage extends React.PureComponent {
  static async getInitialProps({ query, req }) {
    if (query.id) {
      const { data } = await axios.get(`/api/page/${encodeURIComponent(query.id)}`, crossuser(req));
      return { page: data };
    } else {
      return {
        page: {
          elements: JSON.parse(query.elements),
          title: query.title,
          notes: query.notes
        }
      };
    }
  }

  componentDidMount() {
    this.props.setPageTitle(this.props.page.title);
  }

  render() {
    const { page } = this.props;
    return (<>
      <Head>
        <link key="canonical" rel="canonical" href={`/page/${page._id}`} />
        <meta key="description" name="description" content={page.title} />
      </Head>
      <div className="container">
        <Session>
          {session => (<>
            <Page {...page} />
            <div className="push-12">
              {page.notes ? (<p className="is-size-7 has-text-grey margin-2">{page.notes}</p>) : null}
              {session.hasPermission(permissions.page) &&
                <A className="button is-link" href={`/admin/page/${page._id}`}><FormattedMessage id="edit" /></A>
              }
            </div>
          </>)}
        </Session>
      </div>
    </>);
  }
});
