import React from "react";
import config from "../config/client";
import { get, post } from "axios";
import withStores from "../store/withStores";
import NotificationStore from "../store/Notification";
import { FormattedMessage } from "react-intl";

export default withStores(NotificationStore, class WebPush extends React.PureComponent {
  constructor(p) {
    super(p);
    this.promptForNotifications = this.promptForNotifications.bind(this);
    this.subscribeToNotifications = this.subscribeToNotifications.bind(this);
  }

  componentDidMount() {
    if ("serviceWorker" in navigator) {
      console.log("WAIT FOR Service worker ready ...");
      navigator.serviceWorker.ready.then(() => {
        console.log("Service worker ready ...");
        setTimeout(this.promptForNotifications, config.promptForNotificationsAfter);
      });
    }
  }

  async subscribeToNotifications(key) {
    const sw = await navigator.serviceWorker.getRegistration();
    console.log("got sw", sw);
    const subscription = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key)
    });
    console.log("got subscription", subscription);
    post("/api/push/subscribe", subscription);
  }

  /**
   * Asks the user if they want to install notifications.
   */
  async promptForNotifications() {
    const { data } = await get("/api/push/vapid");
    this.props.notificationStore.push({
      type: "info",
      children: "puuush?",
      buttons: [
        {
          _id: "yes",
          type: "success",
          text: (<FormattedMessage id="yes" />),
          action: () => this.subscribeToNotifications(data.key)
        },
        {
          _id: "no",
          type: "danger",
          text: (<FormattedMessage id="no" />)
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
