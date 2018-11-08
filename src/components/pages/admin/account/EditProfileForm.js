import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextField from "@react-formilicious/bulma/TextField";
/*import Checkbox from "react-formilicious/fields/Checkbox";
import required from "react-formilicious/validators/required";*/
import { FormattedMessage, injectIntl } from "react-intl";
import FileField from "../../../general/fields/FileField";
import RichTextField from "../../../general/fields/RichTextField";
import { ContentSaveIcon, ErrorOutlineIcon } from "mdi-react";
import { postRules } from "../../../../slate-renderer";
import SoftBreak from "slate-soft-break";
import PasteLinkify from "slate-paste-linkify";
import config from "../../../../config/client";
import { formatBytes } from "../../../../bytes";
import pwned from "@react-formilicious/validator-pwned";

const rules = postRules();
const plugins = [
  SoftBreak({
    onlyIn: ["block-quote", "code-block"],
    shift: true
  }),
  PasteLinkify({
    type: "link"
  })
];

export default injectIntl(class LogInForm extends React.PureComponent {

  componentDidCatch() { }

  render() {
    return (<Form
      data={this.props.data}
      buttons={[
        {
          // todo: other action buttons
          key: "submit",
          action: "submit",
          name: (<span>
            <ContentSaveIcon className="mdi-icon-spacer" />
            <FormattedMessage id="save" />
          </span>),
          type: "primary"
        }
      ]}
      onSubmit={this.props.onSubmit}
      elements={[
        {
          key: "avatar",
          type: FileField,
          name: (<FormattedMessage id="account.avatar.field" />),
          validator: avatar => ({
            error: avatar.size > config.maxAvatarSize,
            message: (<FormattedMessage id="account.avatar.errorTooLarge" values={{
              isSize: formatBytes(avatar.size),
              maxSize: formatBytes(config.maxAvatarSize)
            }} />)
          })
        },
        {
          key: "bio",
          type: RichTextField,
          name: (<FormattedMessage id="account.bio.field" />),
          placeholder: (<FormattedMessage id="account.bio.placeholder" />),
          rules, plugins
        },
        {
          key: "passwordNew",
          type: TextField,
          name: (<FormattedMessage id="account.changePassword.field1" />),
          mode: "password",
          ignoreData: true,
          placeholder: this.props.intl.formatMessage({ id: "account.changePassword.field1Placeholder" }),
          validator: pwned()
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
          })
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
          placeholder: this.props.intl.formatMessage({ id: "account.changePassword.placeholder" }),
          validator: pw => ({ // todo: required()
            error: !pw,
            message: <FormattedMessage id="formValueRequired" values={{
              field: <FormattedMessage id="account.confirmPassword.field" />
            }} />
          })
        }
      ]} />);
  }
});