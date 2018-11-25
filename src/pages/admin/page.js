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
      state: "loading",
      allPaths: [],
      elements: []
    };
  }

  static async getInitialProps({ query }) {
    return { id: query.id, query };
  }

  updateTitle() {
    let title = "";
    const { state } = this.state;
    switch (state) {
      case "loaded": {
        title = this.state.isNew
          ? this.props.intl.formatMessage({ id: "page.manage.new" })
          : this.props.intl.formatMessage({ id: "page.manage.edit" }, { title: this.state.title })
        break;
      }
      case "loading": {
        title = this.props.intl.formatMessage({ id: "loading" });
        break;
      }
      case "error": {
        title = this.props.intl.formatMessage({ id: "error" });
        break;
      }
    }
    this.props.setPageTitle(title);
  }

  async componentDidMount() {
    const { id } = this.props;
    // Load full page data.
    if (id) {
      try {
        const { data: pageData } = await axios.get(`/api/page/${id}`);
        this.setState({ ...pageData, state: "loaded", isNew: false }, () => this.updateTitle());
      } catch (e) {
        console.error("Failed to load page", e);
        this.setState({ error: e, state: "error" }, () => this.updateTitle());
      }
    } else {
      this.setState({ elements: [{ type: "card", id: "root" }], state: "loaded", isNew: true }, () => this.updateTitle());
    }
    // Load all navigation tags available.
    try {
      const { data: pathData } = await axios.get("/api/page-paths");
      this.setState({ allPaths: pathData.paths });
    } catch (e) {
      console.error("Failed to load page paths", e);
    }
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
            .then(() => this.setState({ _id: null, isNew: true }, () => {
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
    const { _id, elements, isNew } = this.state;
    const data = { _id, title, elements, notes, path };
    const promise = isNew ? axios.post("/api/page", data) : axios.put(`/api/page/${_id}`, data);
    promise
      .then(({ data }) => {
        this.setState({ ...data, isNew: false }, () => {
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

  renderLoading() {
    // TODO: Spinner
    return (<Card title={(<p><FormattedMessage id="loading" /></p>)}>
      <LoadingIcon className="mdi-icon-titanic" />
    </Card>);
  }

  renderError() {
    const { error } = this.state;
    return (<FullError error={error} />);
  }

  renderLoaded() {
    const { elements, title, path, notes, isNew } = this.state;
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
            onDelete={isNew ? undefined : this.onDelete}
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
    const { state } = this.state;
    switch (state) {
      case "loaded": return this.renderLoaded();
      case "loading": return this.renderLoading();
      case "error": return this.renderError();
    }
  }
}));
