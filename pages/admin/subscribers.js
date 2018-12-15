import React from "react";
import { FormattedMessage, FormattedDate, injectIntl } from "react-intl";
import Card from "../../components/layout/Card";
import MessageForm from "../../components/forms/MessageForm";
import withStores from "../../store/withStores";
import NotificationStore from "../../store/Notification";
import config from "../../config/client";
import { get, post } from "axios";
import Media from "../../components/layout/Media";
import Version from "../../components/Version";
import crossuser from "../../utils/crossuser";
import RssFeedIcon from "mdi-react/RssFeedIcon";

export default withStores(NotificationStore, injectIntl(class PagesPage extends React.Component {
  constructor(p) {
    super(p);
    this.renderSubscriber = this.renderSubscriber.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
  }

  static async getInitialProps({ req }) {
    const { data } = await get("/api/subscription", crossuser(req));
    return { subscribers: data };
  }

  async sendNotification(notification) {
    try {
      const { data } = await post("/api/subscription/send", notification);
      this.props.notificationStore.push({
        timeout: 10000,
        icon: RssFeedIcon,
        title: (<FormattedMessage id="subscribers.messageRecipients" values={{
          recipients: data.count
        }} />),
        type: "success",
        children: (<span>
          <em>{notification.title}</em> - {notification.body}
        </span>)
      });
    } catch (error) {
      this.props.notificationStore.pushError(error);
    }
  }

  componentDidMount() {
    const title = this.props.intl.formatMessage({ id: "subscribers.title" });
    this.props.setPageTitle(title);
  }

  render() {
    return (
      <div className="container">
        <Card
          title={(<FormattedMessage id="subscribers.title" />)}
          subtitle={(<FormattedMessage id="subscribers.subtitle" />)}>
          {this.renderComposer()}
          <hr />
          {this.renderSubscribers()}
        </Card>
      </div>);
  }

  renderComposer() {
    return (<div>
      <h2><FormattedMessage id="subscribers.newMessage" /></h2>
      <MessageForm url={`https://${config.domains[0]}:${config.port.https}/`} onSend={this.sendNotification} />
    </div>)
  }

  renderSubscribers() {
    const { subscribers } = this.props;
    return (<div>
      <h2><FormattedMessage id="subscribers.allSubscribers" /></h2>
      {subscribers.map(this.renderSubscriber)}
    </div>)
  }

  renderSubscriber(subscriber) {
    return (<Media key={subscriber._id} title={(<span>
      <strong style={{ marginRight: 2 }}>
        <Version detailed {...subscriber.browser} /> (<Version detailed={false} {...subscriber.os} /> - {subscriber.device.family})
      </strong> - <FormattedDate value={subscriber.since} />
    </span>)}>
    </Media>);
  }
}));
