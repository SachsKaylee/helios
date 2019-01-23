import Form from "@react-formilicious/bulma";
import { FormattedMessage, injectIntl } from "react-intl";
import { formatBytes } from "../../utils/bytes";
import TagList from "@react-formilicious/bulma/TagList";
import TextField from "@react-formilicious/bulma/TextField";
import FileField from "../fields/FileField";
import RichTextField from "../fields/RichTextField";
import ContentSaveIcon from "mdi-react/ContentSaveIcon";
import CancelIcon from "mdi-react/CancelIcon";
import config from "../../config/client";
import required from "@react-formilicious/core/validators/required";
import combined from "@react-formilicious/core/validators/combined";
import pwned from "../../utils/validator/pwned";
import { permissions } from "../../common/permissions";

export default injectIntl(class CreateUserForm extends Form {
  render() {
    const { onSubmit, onCancel, isCreating, data } = this.props;
    return <Form
      elements={isCreating ? this.newElements() : this.editElements()}
      submitText={(<span>
        <ContentSaveIcon className="mdi-icon-spacer" />
        {isCreating
          ? <FormattedMessage id="users.createUser" />
          : <FormattedMessage id="users.updateUser" />}
      </span>)}
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
        },
        {
          key: "cancel",
          action: onCancel,
          name: (<span>
            <CancelIcon className="mdi-icon-spacer" />
            <FormattedMessage id="cancel" />
          </span>),
          type: "danger"
        }
      ]}
      onSubmit={onSubmit}
      data={data} />
  }

  baseElements() {
    return [
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
        placeholder: (<FormattedMessage id="account.bio.placeholder" />)
      },
      {
        key: "permissions",
        name: (<FormattedMessage id="permissions" />),
        type: TagList,
        allowCustomTags: false,
        tags: Object.keys(permissions)
      }
    ];
  }
  newElements() {
    return [
      {
        key: "id",
        type: TextField,
        name: (<FormattedMessage id="username" />),
        placeholder: this.props.intl.formatMessage({ id: "username" })
      },
      ...this.baseElements(),
      {
        key: "password",
        type: TextField,
        name: (<FormattedMessage id="password" />),
        mode: "password",
        ignoreData: true,
        placeholder: this.props.intl.formatMessage({ id: "users.password.placeholder" }),
        validator: combined([
          required(<FormattedMessage id="formValueRequired" values={{ field: <FormattedMessage id="password" /> }} />),
          pwned()
        ])
      },
      {
        key: "passwordConfirm",
        type: TextField,
        name: (<FormattedMessage id="users.password.confirm" />),
        mode: "password",
        ignoreData: true,
        placeholder: this.props.intl.formatMessage({ id: "users.password.placeholder" }),
        validator: (passwordConfirm, { password }) => ({
          error: passwordConfirm !== password,
          message: (<FormattedMessage id="account.changePassword.mismatchError" />)
        })
      }
    ]
  }
  editElements() {
    return [
      ...this.baseElements(),
      {
        key: "password",
        type: TextField,
        name: (<FormattedMessage id="account.changePassword.field1" />),
        mode: "password",
        ignoreData: true,
        placeholder: this.props.intl.formatMessage({ id: "users.password.placeholder" })
      },
      {
        key: "passwordConfirm",
        type: TextField,
        name: (<FormattedMessage id="account.changePassword.field2" />),
        mode: "password",
        ignoreData: true,
        placeholder: this.props.intl.formatMessage({ id: "users.password.placeholder" }),
        validator: (passwordConfirm, { password }) => ({
          error: passwordConfirm !== password,
          message: (<FormattedMessage id="account.changePassword.mismatchError" />)
        })
      }
    ];
  }

});
