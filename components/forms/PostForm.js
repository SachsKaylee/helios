import * as React from "react";
import Form from "@react-formilicious/bulma";
import TagList from "@react-formilicious/bulma/TagList";
import TextArea from "@react-formilicious/bulma/TextArea";
import PublishIcon from "mdi-react/PublishIcon";
import FileUndoIcon from "mdi-react/FileUndoIcon";
import DeleteIcon from "mdi-react/DeleteIcon";
import { FormattedMessage, injectIntl } from "react-intl";
import onlyTruthy from "../../utils/onlyTruthy";

export default injectIntl(class PostForm extends React.PureComponent {
  render() {
    return (<Form
      data={{
        tags: this.props.tags,
        notes: this.props.notes
      }}
      onChange={this.props.onChange}
      elements={[
        {
          type: TextArea,
          key: "notes",
          name: (<FormattedMessage id="post.notes.field" />),
          lines: 4,
          placeholder: this.props.intl.formatMessage({ id: "post.notes.placeholder" })
        },
        {
          type: TagList,
          key: "tags",
          name: (<FormattedMessage id="tags" />), // todo: locale & for add button
          allowCustomTags: true,
          tags: this.props.allTags,
          addCustomTagText: this.props.intl.formatMessage({ id: "post.tags" }),
          addCustomTagButtonText: (<FormattedMessage id="add" />)
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
