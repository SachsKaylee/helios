import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextField from "@react-formilicious/bulma/TextField";
import { FormattedMessage, injectIntl } from "react-intl";
import FileBrowserField from "../fields/FileBrowserField";
import RichTextField from "../fields/RichTextField";
import ContentSaveIcon from "mdi-react/ContentSaveIcon";
import ErrorOutlineIcon from "mdi-react/ErrorOutlineIcon";
import { formatBytes } from "../../utils/bytes";
import pwned from "../../utils/validator/pwned";

export default injectIntl(class EditProfileForm extends React.PureComponent {
  render() {
    return (<Form
      data={this.props.data}
      // TODO: other action buttons
      buttons={[
        {
          key: "submit",
          action: "submit",
          name: (<span>
            <ContentSaveIcon className="mdi-icon-spacer" />
            <FormattedMessage id="save" />
          </span>),
          type: "primary"
        },
        ...(this.props.buttons || [])
      ]}
      onSubmit={this.props.onSubmit}
      elements={[
        {
          key: "avatar",
          type: FileBrowserField,
          onlyImages: true,
          name: (<FormattedMessage id="account.avatar.field" />),
          validator: avatar => ({
            error: avatar.size > this.props.maxAvatarSize,
            message: (<FormattedMessage id="account.avatar.errorTooLarge" values={{
              isSize: formatBytes(avatar.size),
              maxSize: formatBytes(this.props.maxAvatarSize)
            }} />)
          })
        },
        {
          key: "bio",
          type: RichTextField,
          name: (<FormattedMessage id="account.bio.field" />),
          placeholder: (<FormattedMessage id="account.bio.placeholder" />)
        },
        {
          key: "passwordNew",
          type: TextField,
          name: (<FormattedMessage id="account.changePassword.field1" />),
          mode: "password",
          ignoreData: true,
          placeholder: this.props.intl.formatMessage({ id: "account.changePassword.field1Placeholder" }),
          validator: pwned(),
          autocomplete: "new-password"
        },
        {
          key: "passwordNewConfirm",
          type: TextField,
          name: (<FormattedMessage id="account.changePassword.field2" />),
          mode: "password",
          ignoreData: true,
          placeholder: this.props.intl.formatMessage({ id: "account.changePassword.field2Placeholder" }),
          validator: (v, d) => ({ // todo: add high level validator
            error: v !== d.passwordNew,
            message: (<FormattedMessage id="account.changePassword.mismatchError" />)
          }),
          autocomplete: "new-password"
        },
        {
          key: "password",
          type: TextField,
          name: (<span>
            <ErrorOutlineIcon className="mdi-icon-spacer" />
            <FormattedMessage id="account.confirmPassword.field" />
          </span>),
          mode: "password",
          ignoreData: true,
          placeholder: this.props.intl.formatMessage({ id: "account.confirmPassword.placeholder" }),
          validator: pw => ({ // todo: required()
            error: !pw,
            message: <FormattedMessage id="formValueRequired" values={{
              field: <FormattedMessage id="account.confirmPassword.field" />
            }} />
          }),
          autocomplete: "current-password"
        }
      ]} />);
  }
});