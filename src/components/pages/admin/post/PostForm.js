import * as React from "react";
import Form from "@react-formilicious/bulma";
import TagList from "@react-formilicious/bulma/TagList";
import TextArea from "@react-formilicious/bulma/TextArea";
import { PublishIcon, FileUndoIcon, DeleteIcon } from "mdi-react";
import { FormattedMessage, injectIntl } from "react-intl";
import { onlyTruthy } from "../../../../fp";

export default injectIntl(class PostForm extends React.PureComponent {
  render() {
    return (<Form
      data={{
        tags: this.props.tags
      }}
      elements={[
        {
          type: TextArea,
          key: "notes",
          name: "Notes",
          lines: 4,
          placeholder: "Take some quick notes about your post. They are only visible to other authors."
        },
        {
          type: TagList,
          key: "tags",
          name: "Tags", // todo: locale & for add button
          allowCustomTags: true,
          tags: this.props.allTags || ["tag-1", "awesome"]
        }
      ]}
      buttons={onlyTruthy([
        {
          key: "submit",
          action: "submit",
          name: (<><PublishIcon className="mdi-icon-spacer" /> <FormattedMessage id="publish" /></>),
          type: "primary"
        },
        {
          key: "discard",
          type: "danger",
          name: (<><FileUndoIcon className="mdi-icon-spacer" /> <FormattedMessage id="discard" /></>),
          action: "reset"
        },
        this.props.onDelete && {
          key: "delete",
          type: "danger",
          name: (<><DeleteIcon className="mdi-icon-spacer" /> <FormattedMessage id="delete" /></>),
          action: this.props.onDelete
        }
      ])}
      onSubmit={this.props.onPublish}
    />);
  }
});
