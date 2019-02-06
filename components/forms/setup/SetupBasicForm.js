import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextField from "@react-formilicious/bulma/TextField";
import TagList from "@react-formilicious/bulma/TagList";
import required from "@react-formilicious/core/validators/required";
import combined from "@react-formilicious/core/validators/combined";
import { FormattedMessage, injectIntl } from "react-intl";
import PublishIcon from "mdi-react/PublishIcon";
import ArrowBackIcon from "mdi-react/ArrowBackIcon";
import DropdownField from "../../fields/DropdownField";

export default injectIntl(class SetupBasicForm extends React.PureComponent {
  render() {
    const { onSubmit, onChange, data } = this.props;
    return (<Form
      data={data}
      elements={[
        {
          type: TextField,
          key: "ports.http",
          name: (<FormattedMessage id="system.setup.fields.portHttp.name" />),
          mode: "number",
          validator: required()
        },
        {
          type: TextField,
          key: "ports.https",
          name: (<FormattedMessage id="system.setup.fields.portHttps.name" />),
          mode: "number",
          validator: required()
        },
        {
          type: TagList,
          key: "domains",
          name: (<FormattedMessage id="system.setup.fields.domains.name" />),
          validator: combined(required(), value => value.includes("localhost") || value.includes("127.0.0.1")
            ? { validated: "error", message: this.props.intl.formatMessage({ id: "system.setup.fields.domains.noLocalhost" }) }
            : { validated: "hint", message: this.props.intl.formatMessage({ id: "system.setup.fields.domains.dnsRecord" }) })
        },
        {
          type: TextField,
          key: "webmasterMail",
          name: (<FormattedMessage id="system.setup.fields.webmasterMail.name" />),
          mode: "email",
          validator: required()
        },
        {
          type: DropdownField,
          key: "ssl",
          name: (<FormattedMessage id="system.setup.fields.ssl.name" />),
          values: [
            {
              key: "letsEncrypt",
              label: (<FormattedMessage id="system.setup.fields.ssl.letsEncrypt" />)
            },
            {
              key: "certificate",
              label: (<FormattedMessage id="system.setup.fields.ssl.certificate" />)
            },
            {
              key: "none",
              label: (<FormattedMessage id="system.setup.fields.ssl.none" />)
            }
          ],
          validator: combined(required(), value => value === "certificate"
            ? { validated: "hint", message: this.props.intl.formatMessage({ id: "system.setup.fields.ssl.certificateFile" }) }
            : true)
        }
      ]}
      buttons={[
        {
          key: "back",
          type: "link",
          action: this.props.onBack,
          name: (<><ArrowBackIcon className="mdi-icon-spacer" /> <FormattedMessage id="back" /></>)
        },
        {
          key: "submit",
          type: "primary",
          action: "submit",
          name: (<><PublishIcon className="mdi-icon-spacer" /> <FormattedMessage id="save" /></>)
        }
      ]}
      onChange={onChange}
      onSubmit={onSubmit}
    />);
  }
});
