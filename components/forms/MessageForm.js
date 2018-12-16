import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextField from "@react-formilicious/bulma/TextField";
import TextArea from "@react-formilicious/bulma/TextArea";
import range from "@react-formilicious/core/validators/range";
import PublishIcon from "mdi-react/PublishIcon";
import FileUndoIcon from "mdi-react/FileUndoIcon";
import { FormattedMessage, injectIntl } from "react-intl";
import onlyTruthy from "../../utils/onlyTruthy";

export default injectIntl(class MessageForm extends React.PureComponent {
  render() {
    return (<Form
      data={{
        title: this.props.title,
        url: this.props.url,
        body: this.props.body
      }}
      elements={[
        {
          type: TextField,
          key: "title",
          name: (<FormattedMessage id="subscribers.message.title.field" />),
          placeholder: this.props.intl.formatMessage({ id: "subscribers.message.title.placeholder" })
        },
        {
          type: TextArea,
          key: "body",
          name: (<FormattedMessage id="subscribers.message.body.field" />),
          lines: 2,
          placeholder: this.props.intl.formatMessage({ id: "subscribers.message.body.placeholder" }),
          validator: range({ max: 140 })
        },
        {
          type: TextField,
          key: "url",
          name: (<FormattedMessage id="subscribers.message.url.field" />),
          placeholder: this.props.intl.formatMessage({ id: "subscribers.message.url.placeholder" })
        }
      ]}
      buttons={onlyTruthy([
        {
          key: "submit",
          action: "submit",
          name: (<><PublishIcon className="mdi-icon-spacer" /> <FormattedMessage id="send" /></>),
          type: "primary"
        },
        {
          key: "discard",
          type: "danger",
          name: (<><FileUndoIcon className="mdi-icon-spacer" /> <FormattedMessage id="discard" /></>),
          action: "reset"
        }
      ])}
      onSubmit={this.props.onSend}
    />);
  }
});
