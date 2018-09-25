import Form from "@react-formilicious/bulma";
import { FormattedMessage, injectIntl } from "react-intl";
import { formatBytes } from "../../../../bytes";
import TagList from "@react-formilicious/bulma/TagList";
import TextField from "@react-formilicious/bulma/TextField";
import FileField from "../../../general/fields/FileField";
import { ContentSaveIcon } from "mdi-react";
import config from "../../../../config/client";
import required from "@react-formilicious/core/validators/required";
import combined from "@react-formilicious/core/validators/combined";
import pwned from "@react-formilicious/validator-pwned";

export default injectIntl(class CreateUserForm extends Form {
  render() {
    const { onSubmit, isCreating, data } = this.props;
    return <Form
      elements={isCreating ? this.newElements() : this.editElements()}
      submitText={(<span>
        <ContentSaveIcon className="mdi-icon-spacer" />
        {isCreating
          ? <FormattedMessage id="users.createUser" />
          : <FormattedMessage id="users.updateUser" />}
      </span>)}
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
      // todo: richtext
      /*{
        key: "bio",
        type: "richtext",
        name: (<FormattedMessage id="account.bio.field" />),
        placeholder: (<FormattedMessage id="account.bio.placeholder" />)
      },*/
      {
        key: "permissions",
        name: "Permissions", // todo: locale
        type: TagList,
        allowCustomTags: false,
        tags: ["author"]
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
