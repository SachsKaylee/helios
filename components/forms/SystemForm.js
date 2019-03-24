import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextArea from "@react-formilicious/bulma/TextArea";
import TagList from "@react-formilicious/bulma/TagList";
import TextField from "@react-formilicious/bulma/TextField";
import required from "@react-formilicious/core/validators/required";
import range from "@react-formilicious/core/validators/range";
import combined from "@react-formilicious/core/validators/combined";
import PublishIcon from "mdi-react/PublishIcon";
import FileUndoIcon from "mdi-react/FileUndoIcon";
import { FormattedMessage, injectIntl } from "react-intl";
import onlyTruthy from "../../utils/onlyTruthy";
import Checkbox from "@react-formilicious/bulma/Checkbox";

export default injectIntl(class SystemForm extends React.PureComponent {
  render() {
    const { onChange, onSubmit, data } = this.props;
    return (<Form
      data={data}
      onChange={onChange}
      elements={[
        {
          type: TextField,
          key: "title",
          name: (<FormattedMessage id="system.fields.title.name" />),
          validator: required(),
          placeholder: this.props.intl.formatMessage({ id: "system.fields.title.placeholder" })
        },
        {
          type: TextArea,
          key: "description",
          name: (<FormattedMessage id="system.fields.description.name" />),
          lines: 2,
          validator: combined([
            required(),
            range({ max: 200 })
          ]),
          placeholder: this.props.intl.formatMessage({ id: "system.fields.description.name" })
        },
        {
          type: TagList,
          key: "defaultTags",
          name: (<FormattedMessage id="system.fields.defaultTags.name" />), // todo: locale & for add button
          allowCustomTags: true,
          tags: this.props.allTags || [],
          addCustomTagText: this.props.intl.formatMessage({ id: "post.tags" }),
          addCustomTagButtonText: (<FormattedMessage id="add" />)
        },
        {
          key: "hideLogInButton",
          type: Checkbox,
          name: <FormattedMessage id="system.fields.hideLogInButton.name" />
        }
      ]}
      buttons={onlyTruthy([
        {
          key: "submit",
          type: "primary",
          action: "submit",
          name: (<><PublishIcon className="mdi-icon-spacer" /> <FormattedMessage id="publish" /></>)
        },
        {
          key: "reset",
          action: "reset",
          type: "danger",
          name: (<><FileUndoIcon className="mdi-icon-spacer" /> <FormattedMessage id="discard" /></>)
        }
      ])}
      onSubmit={onSubmit}
    />);
  }
});
