import React from "react";
import Card from "../../components/layout/Card"
import axios from "axios";
import { FormattedMessage, injectIntl } from "react-intl";
import LoadingIcon from "mdi-react/LoadingIcon";
import CakeIcon from "mdi-react/CakeIcon";
import TrashIcon from "mdi-react/TrashIcon";
import { FullError, SlimError } from "../../components/Error";
import PageForm from "../../components/forms/PageForm";
import Editor from "../../components/page/Editor";
import NotificationStore from "../../store/Notification";
import crossuser from "../../utils/crossuser";
import withStores from "../../store/withStores";
import A from "../../components/system/A";

export default withStores(NotificationStore, injectIntl(class PagePage extends React.PureComponent {
  constructor(p) {
    super(p);
    this.onChange = this.onChange.bind(this);
    this.onPreview = this.onPreview.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.previewForm = React.createRef();
    this.notification = React.createRef();
    this.state = {
      ...this.props.data,
      allPaths: []
    };
  }

  static async getInitialProps({ query, req }) {
    const { id } = query;
    const { data: pathData } = await axios.get("/api/page-paths", crossuser(req));
    // Load full page data.
    if (id) {
      try {
        const { data } = await axios.get(`/api/page/${id}`, crossuser(req));
        return { id, pathData, data };
      } catch (error) {
        return { id, pathData, error };
      }
    } else {
      return {
        pathData, data: {
          elements: [{ type: "card", id: "root" }]
        }
      };
    }
  }

  updateTitle() {
    let title = "";
    const { error } = this.props;
    if (error) {
      title = this.props.intl.formatMessage({ id: "error" });
    } else {
      title = this.state._id
        ? this.props.intl.formatMessage({ id: "page.manage.edit" }, { title: this.state.title })
        : this.props.intl.formatMessage({ id: "page.manage.new" });
    }
    this.props.setPageTitle(title);
  }

  componentDidMount() {
    this.updateTitle();
  }

  onDelete() {
    this.props.notificationStore.push({
      canClose: true,
      type: "danger",
      title: (<FormattedMessage id="page.notification.delete.title" />),
      icon: TrashIcon,
      children: (<FormattedMessage id="page.notification.delete.description" />),
      buttons: [
        {
          text: (<FormattedMessage id="page.notification.delete.confirm" />),
          action: () => axios
            .delete(`/api/page/${this.state._id}`)
            .then(() => this.setState({ _id: null }, () => {
              this.updateTitle();
              this.props.notificationStore.push({
                canClose: true,
                type: "success",
                title: (<FormattedMessage id="page.notification.deleted.title" />),
                icon: CakeIcon,
                children: (<FormattedMessage id="page.notification.deleted.description" />)
              });
            }))
        }
      ]
    });
  }

  onChange(elements) {
    this.setState({ elements });
  }

  onPublish = ({ title, notes, path }) => {
    const { _id, elements } = this.state;
    const data = { _id, title, elements, notes, path };
    const promise = _id ? axios.put(`/api/page/${_id}`, data) : axios.post("/api/page", data);
    promise
      .then(({ data }) => {
        this.setState({ ...data }, () => {
          this.updateTitle();
          this.props.notificationStore.push({
            canClose: true,
            type: "success",
            title: (<FormattedMessage id="page.notification.published.title" />),
            icon: CakeIcon,
            children: (<FormattedMessage id="page.notification.published.description" values={{
              link: (<A href={`/page/${data._id}`}>{data.title}</A>)
            }} />)
          });
        });
      })
      .catch(error => this.props.notificationStore.pushError(error));
  }

  onPreview(data) {
    const form = this.previewForm.current;
    form.elements.value = JSON.stringify(this.state.elements);
    form.title.value = data.title;
    form.notes.value = data.notes;
    form.submit();
  }

  renderError() {
    const { error } = this.state;
    return (<FullError error={error} />);
  }

  renderLoaded() {
    const { elements, title, path, notes, _id } = this.state;
    return (
      <div className="container">
        <Editor onChange={this.onChange} elements={elements} />
        <Card>
          <PageForm
            notes={notes}
            title={title}
            path={path}
            allPaths={this.state.allPaths}
            onPublish={this.onPublish}
            onPreview={this.onPreview}
            onDelete={_id ? this.onDelete : undefined}
          />
        </Card>

        <form method="get" action="/page" target="_blank" ref={this.previewForm}>
          <input type="hidden" name="elements" value="[]" />
          <input type="hidden" name="title" value="" />
          <input type="hidden" name="notes" value="" />
        </form>
      </div>
    );
  }

  render() {
    const { error } = this.props;
    if (error) {
      return this.renderError();
    } else {
      return this.renderLoaded();
    }
  }
}));
