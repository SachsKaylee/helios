import React from "react";
import { FormattedMessage, FormattedDate, FormattedTime, injectIntl } from "react-intl";
import Card from "../../components/layout/Card";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import config from "../../config/client";
import { get, post } from "axios";
import Media from "../../components/layout/Media";
import Version from "../../components/Version";
import crossuser from "../../utils/crossuser";
import RssFeedIcon from "mdi-react/RssFeedIcon";
import SystemForm from "../../components/forms/SystemForm";

export default withStores(NotificationStore, injectIntl(class SystemPage extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      system: this.props.system
    }
  }

  static async getInitialProps({ req }) {
    const { data } = await get("/api/system", crossuser(req));
    return { system: data };
  }

  componentDidMount() {
    const title = this.props.intl.formatMessage({ id: "system.title" });
    this.props.setPageTitle(title);
  }

  render() {
    return (
      <div className="container">
        <Card
          title={(<FormattedMessage id="system.title" />)}
          subtitle={(<FormattedMessage id="system.subtitle" />)}>
          {this.renderForm()}
        </Card>
      </div>);
  }

  renderForm() {
    return (<SystemForm data={this.state.system} />);
  }
}));
