import * as React from "react";
import Form from "@react-formilicious/bulma";
import TextArea from "@react-formilicious/bulma/TextArea";
import TagList from "@react-formilicious/bulma/TagList";
import TextField from "@react-formilicious/bulma/TextField";
import required from "@react-formilicious/core/validators/required";
import PublishIcon from "mdi-react/PublishIcon";
import EarthIcon from "mdi-react/EarthIcon";
import DeleteIcon from "mdi-react/DeleteIcon";
import { FormattedMessage, injectIntl } from "react-intl";
import onlyTruthy from "../../utils/onlyTruthy";

export default injectIntl(class PageForm extends React.PureComponent {
  render() {
    return (<Form
      data={{
        title: this.props.title,
        notes: this.props.notes,
        path: this.props.path
      }}
      elements={[
        {
          type: TextField,
          key: "title",
          name: (<FormattedMessage id="page.title.field" />),
          validator: required(),
          placeholder: this.props.intl.formatMessage({ id: "page.title.placeholder" })
        },
        {
          type: TagList,
          key: "path",
          limit: 1,
          name: (<FormattedMessage id="page.path.field" />),
          tags: this.props.allPaths,
          addCustomTagText: this.props.intl.formatMessage({ id: "page.path.placeholder" }),
          addCustomTagButtonText: (<FormattedMessage id="add" />)
        },
        {
          type: TextArea,
          key: "notes",
          name: (<FormattedMessage id="page.notes.field" />),
          lines: 4,
          placeholder: this.props.intl.formatMessage({ id: "page.notes.placeholder" })
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
          key: "preview",
          type: "link",
          name: (<><EarthIcon className="mdi-icon-spacer" /> <FormattedMessage id="preview" /></>),
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
