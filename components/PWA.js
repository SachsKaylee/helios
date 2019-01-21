import React from "react";
import config from "../config/client";
import withStores from "../store/withStores";
import NotificationStore from "../store/Notification";
import AppsIcon from "mdi-react/AppsIcon";
import { FormattedMessage } from "react-intl";

const STORAGE_DID_SELECT = "pwa:didSelect";

export default withStores(NotificationStore, class PWA extends React.PureComponent {
  constructor(p) {
    super(p);
    this.state = {
      promptEvent: null
    };
    this.promptForPwa = this.promptForPwa.bind(this);
  }

  componentDidMount() {
    if (config.promptForAddToHomeScreenAfter) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        console.log("Add to home screen?", e);
        // Stash the event so it can be triggered later.
        const didSelect = localStorage.getItem(STORAGE_DID_SELECT);
        if (!didSelect) {
          this.setState({ promptEvent: e });
          window.setTimeout(this.promptForPwa, config.promptForAddToHomeScreenAfter);
        }
      });
    }
  }

  /**
   * Asks the user if they want to install the pwa.
   */
  promptForPwa() {
    this.props.notificationStore.push({
      type: "info",
      icon: AppsIcon,
      title: (<FormattedMessage id="subscribers.pwaPrompt.title" />),
      children: (<FormattedMessage id="subscribers.pwaPrompt.content" />),
      buttons: [
        {
          _id: "yes",
          type: "success",
          text: (<FormattedMessage id="yesPlease" />),
          action: () => {
            this.state.promptEvent.prompt();
            this.state.promptEvent.userChoice.then(result => {
              const didSelect = result.outcode === "accepted" ? "true" : "false";
              localStorage.setItem(STORAGE_DID_SELECT, didSelect);
              this.setState({ promptEvent: null });
            });
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
