import React from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import Card from "../../components/layout/Card";
import A from "../../components/system/A";
import { get } from "axios";
import Media from "../../components/layout/Media";
import crossuser from "../../utils/crossuser";

export default injectIntl(class PagesPage extends React.Component {
  constructor(p) {
    super(p);
  }

  static async getInitialProps({ req }) {
    const { data } = await get("/api/page", crossuser(req));
    return { pages: data };
  }

  componentDidMount() {
    const title = this.props.intl.formatMessage({ id: "page.manage.title" });
    this.props.setPageTitle(title);
  }

  render() {
    const { pages } = this.props;
    return (
      <div className="container">
        <Card
          title={(<FormattedMessage id="page.manage.title" />)}
          subtitle={(<span><A className="button" href="/admin/page"><FormattedMessage id="page.manage.newPage" /></A></span>)}>
          {pages.map(page => (<Media key={page._id} title={(<span>
            <strong style={{ marginRight: 2 }}><A href={`/admin/page/${page._id}`}>{page.title}</A></strong>
            {page.notes}
          </span>)}>
          </Media>))}
        </Card>
      </div>);
  }
});
