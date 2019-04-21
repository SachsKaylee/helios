import * as React from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import PublishIcon from "mdi-react/PublishIcon";
import Form from "@react-formilicious/bulma";
import DropdownField from "../../fields/DropdownField";
import TextField from "@react-formilicious/bulma/TextField";
import required from "@react-formilicious/core/validators/required";
import combined from "@react-formilicious/core/validators/combined";
import pwned from "../../../utils/validator/pwned";

export default injectIntl(class SetupLanguageForm extends React.PureComponent {
  render() {
    const { onSubmit, onChange, data } = this.props;
    return (<Form
      data={data}
      elements={[
        {
          type: DropdownField,
          key: "locale",
          name: (<FormattedMessage id="system.setup.fields.locale.name" />),
          values: [
            {
              key: "en",
              label: (<span>🇬🇧 <strong>English</strong> (English)</span>)
            },
            {
              key: "de",
              label: (<span>🇩🇪 <strong>Deutsch</strong> (German)</span>)
            }
          ],
          validator: required()
        },
        {
          type: TextField,
          key: "name",
          name: (<FormattedMessage id="system.setup.fields.name.name" />),
          placeholder: this.props.intl.formatMessage({ id: "account.usernamePlaceholder" }),
          validator: required(),
          autocomplete: "username"
        },
        {
          type: TextField,
          key: "password",
          mode: "password",
          name: (<FormattedMessage id="system.setup.fields.password.name" />),
          placeholder: this.props.intl.formatMessage({ id: "account.passwordPlaceholder" }),
          validator: combined(required(), pwned()),
          autocomplete: "new-password"
        }
      ]}
      buttons={[
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
