import * as React from "react";
import Form from "@react-formilicious/bulma";
import required from "@react-formilicious/core/validators/required";
import { FormattedMessage, injectIntl } from "react-intl";
import PublishIcon from "mdi-react/PublishIcon";
import DropdownField from "../../fields/DropdownField";

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
