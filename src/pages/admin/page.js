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
    this.state = {
      state: "loading",
      elements: []
    };
  }

  static async getInitialProps({ query: { id } }) {
    return { id };
  }

  componentDidMount() {
    const { id } = this.props;
    id
      ? axios.get(`/api/page/${id}`)
        .then(({ data }) => this.setState({ ...data, state: "loaded", isNew: false }))
        .catch((error) => this.setState({ error, state: "error" }))
      : this.setState({ elements: [{ type: "card", id: "root" }], state: "loaded", isNew: true });
  }

  onChange(elements) {
    this.setState({ elements });
  }
  /*
    onDelete = (really) => () => {
      if (really) {
        const { id } = this.state;
        axios.delete(`/api/post/${id}`).then(() => {
          this.setState({
            id: undefined,
            isNew: true,
            date: new Date()
          }, () => {
            this.notifications.push({
              canClose: true,
              type: "success",
              children: this.renderDeleteSuccessNotification()
            });
          });
        }).catch(error => {
          this.notifications.push({
            canClose: true,
            type: "danger",
            children: this.renderErrorNotification({ error })
          });
        });
      } else {
        this.notifications.push({
          canClose: true,
          type: "danger",
          children: this.renderDeleteConfirmNotification()
        });
      }
    }
  */
  onPublish = ({ title, notes, path }) => {
    const { _id, elements, isNew } = this.state;
    const data = { _id, title, elements, notes, path };
    (isNew
      ? axios.post("/api/page", data)
      : axios.put(`/api/page/${_id}`, data)).then(({ data }) => {
        this.setState({ ...data, isNew: false });
      }).catch(error => {
        this.notifications.push({
          canClose: true,
          type: "error",
          children: this.renderErrorNotification({ error })
        });
      });
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
            onPublish={this.onPublish}
          //onDelete={!isNew && (this.onDelete(false))}
          />
          <NotificationProvider ref={ref => this.notifications = ref} />
        </Card>
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
