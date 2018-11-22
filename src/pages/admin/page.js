import React from "react";
import Card from "../../components/layout/Card"
import axios from "axios";
import NotificationProvider from "../../components/NotificationProvider"
import { FormattedMessage, injectIntl } from "react-intl";
import LoadingIcon from "mdi-react/LoadingIcon";
import { FullError } from "../../components/Error";
import PageForm from "../../components/forms/PageForm";
import Editor from "../../components/page/Editor";

export default injectIntl(class PagePage extends React.PureComponent {
  constructor(p) {
    super(p);
    this.onChange = this.onChange.bind(this);
    this.onPreview = this.onPreview.bind(this);
    this.previewForm = React.createRef();
    this.state = {
      state: "loading",
      allPaths: [],
      elements: []
    };
  }

  static async getInitialProps({ query: { id } }) {
    return { id };
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
        this.setState({ error, state: "error" }, () => this.updateTitle());
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

  onChange(elements) {
    this.setState({ elements });
  }

  onPublish = ({ title, notes, path }) => {
    const { _id, elements, isNew } = this.state;
    const data = { _id, title, elements, notes, path };
    (isNew
      ? axios.post("/api/page", data)
      : axios.put(`/api/page/${_id}`, data)).then(({ data }) => {
        this.setState({ ...data, isNew: false }, () => this.updateTitle());
      }).catch(error => {
        this.notifications.push({
          canClose: true,
          type: "error",
          children: this.renderErrorNotification({ error })
        });
      });
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
    const { elements, title, path, notes, state } = this.state;
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
          //onDelete={!isNew && (this.onDelete(false))}
          />
          <NotificationProvider ref={ref => this.notifications = ref} />
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
});
