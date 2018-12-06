import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextField from "@react-formilicious/bulma/TextField";
import Checkbox from "@react-formilicious/bulma/Checkbox";
import required from "@react-formilicious/core/validators/required";
import { FormattedMessage, injectIntl } from "react-intl";
import LoginIcon from "mdi-react/LoginIcon";

export default injectIntl(class LogInForm extends React.PureComponent {
  render() {
    return <Form
      data={{}}
      onSubmit={this.props.onSubmit}
      buttons={[
        {
          key: "submit",
          action: "submit",
          type: "primary",
          name: (<span><LoginIcon className="mdi-icon-spacer" /><FormattedMessage id="account.signIn" /></span>)
        }
      ]}
      elements={[
        {
          key: "id",
          type: TextField,
          name: <FormattedMessage id="username" />,
          validator: required(<FormattedMessage id="formValueRequired" values={{ field: <FormattedMessage id="username" /> }} />),
          placeholder: this.props.intl.formatMessage({ id: "account.usernamePlaceholder" })
        },
        {
          key: "password",
          type: TextField,
          name: <FormattedMessage id="password" />,
          mode: "password",
          ignoreData: true,
          validator: required(<FormattedMessage id="formValueRequired" values={{ field: <FormattedMessage id="password" /> }} />),
          placeholder: this.props.intl.formatMessage({ id: "account.passwordPlaceholder" })
        },
        {
          key: "cookie",
          type: Checkbox,
          name: <FormattedMessage id="account.acceptCookie" />,
          validator: required(<FormattedMessage id="account.cookieRequired" />)
        }
      ]} />
  }
});