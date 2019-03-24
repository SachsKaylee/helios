import React from "react";
import { get, post } from "axios";
import withStores from "../store/withStores";
import NotificationStore from "../store/Notification";
import RssFeedIcon from "mdi-react/RssFeedIcon";
import { FormattedMessage } from "react-intl";

const STORAGE_DID_SELECT = "subscription:didSelect";

export default withStores(NotificationStore, class WebPush extends React.PureComponent {
  constructor(p) {
    super(p);
    this.promptForNotifications = this.promptForNotifications.bind(this);
    this.subscribeToNotifications = this.subscribeToNotifications.bind(this);
  }

  componentDidMount() {
    if (this.props.promptForNotificationsAfter && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => {
        const didSelect = localStorage.getItem(STORAGE_DID_SELECT);
        if (!didSelect) {
          setTimeout(this.promptForNotifications, this.props.promptForNotificationsAfter);
        }
      });
    }
  }

  async subscribeToNotifications(key) {
    const sw = await navigator.serviceWorker.getRegistration();
    if (sw) {
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key)
      });
      post("/api/subscription/subscribe", {
        subscription,
        device: navigator.userAgent
      });
    } else {
      console.error("No Service Worker found.");
    }
  }

  /**
   * Asks the user if they want to install notifications.
   */
  async promptForNotifications() {
    const { data } = await get("/api/subscription/vapid");
    this.props.notificationStore.push({
      type: "info",
      icon: RssFeedIcon,
      title: (<FormattedMessage id="subscribers.prompt.title" />),
      children: (<FormattedMessage id="subscribers.prompt.content" />),
      buttons: [
        {
          _id: "yes",
          type: "success",
          text: (<FormattedMessage id="yesPlease" />),
          action: () => {
            this.subscribeToNotifications(data.key);
            localStorage.setItem(STORAGE_DID_SELECT, "true");
          }
        },
        {
          _id: "no",
          type: "danger",
          text: (<FormattedMessage id="noThanks" />),
          action: () => {
            localStorage.setItem(STORAGE_DID_SELECT, "false");
          }
        }
      ]
    });
  }

  render() {
    return null;
  }
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
