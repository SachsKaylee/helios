import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextField from "@react-formilicious/bulma/TextField";
import TextArea from "@react-formilicious/bulma/TextArea";
import ToggleField from "@react-formilicious/bulma/ToggleField";
import TagList from "@react-formilicious/bulma/TagList";
import required from "@react-formilicious/core/validators/required";
import { FormattedMessage, injectIntl } from "react-intl";
import PublishIcon from "mdi-react/PublishIcon";
import DropdownField from "../../fields/DropdownField";
import FileDiscardIcon from "mdi-react/FileDiscardIcon";
import FileBrowserField from "../../fields/FileBrowserField";

export default injectIntl(class SettingsForm extends React.PureComponent {
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
          key: "title",
          name: (<FormattedMessage id="system.setup.fields.title.name" />),
          validator: required()
        },
        {
          type: TextArea,
          key: "description",
          name: (<FormattedMessage id="system.setup.fields.description.name" />),
          validator: required()
        },
        {
          type: TagList,
          key: "topics",
          name: (<FormattedMessage id="system.setup.fields.topics.name" />)
        },
        {
          type: TextField,
          key: "postsPerPage",
          name: (<FormattedMessage id="system.setup.fields.postsPerPage.name" />),
          mode: "number",
          validator: required()
        },
        {
          type: TextField,
          key: "postsPerAboutPage",
          name: (<FormattedMessage id="system.setup.fields.postsPerAboutPage.name" />),
          mode: "number",
          validator: required()
        },
        {
          type: ToggleField,
          key: "hideLogInButton",
          name: (<FormattedMessage id="system.setup.fields.hideLogInButton.name" />)
        },
        {
          type: TagList,
          key: "defaultTags",
          name: (<FormattedMessage id="system.setup.fields.defaultTags.name" />)
        },
        {
          type: TextField,
          key: "promptForNotificationsAfter",
          name: (<FormattedMessage id="system.setup.fields.promptForNotificationsAfter.name" />),
          mode: "number"
        },
        {
          type: TextField,
          key: "promptForAddToHomeScreenAfter",
          name: (<FormattedMessage id="system.setup.fields.promptForAddToHomeScreenAfter.name" />),
          mode: "number"
        },
        {
          type: ToggleField,
          key: "branding",
          name: (<FormattedMessage id="system.setup.fields.branding.name" />)
        },
        {
          type: TextField,
          key: "maxPayloadSize",
          name: (<FormattedMessage id="system.setup.fields.maxPayloadSize.name" />),
          mode: "number"
        },
        {
          type: TextField,
          key: "readMore",
          name: (<FormattedMessage id="system.setup.fields.readMore.name" />),
          mode: "number"
        },
        {
          type: FileBrowserField,
          key: "favicon",
          name: (<FormattedMessage id="system.setup.fields.favicon.name" />),
          onlyImages: true
        },
        {
          type: FileBrowserField,
          key: "defaultAvatar",
          name: (<FormattedMessage id="system.setup.fields.defaultAvatar.name" />),
          onlyImages: true
        }
      ]}
      buttons={[
        {
          key: "submit",
          type: "primary",
          action: "submit",
          name: (<><PublishIcon className="mdi-icon-spacer" /> <FormattedMessage id="save" /></>)
        },
        {
          key: "back",
          type: "danger",
          action: "reset",
          name: (<><FileDiscardIcon className="mdi-icon-spacer" /> <FormattedMessage id="discard" /></>)
        }
      ]}
      onChange={onChange}
      onSubmit={onSubmit}
    />);
  }
});
