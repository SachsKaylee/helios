import React from "react";
import Card from "../../components/layout/Card"
import axios from "axios";
import { FormattedMessage, injectIntl, FormattedRelative } from "react-intl";
import CakeIcon from "mdi-react/CakeIcon";
import TrashIcon from "mdi-react/TrashIcon";
import { FullError } from "../../components/Error";
import PageForm from "../../components/forms/PageForm";
import Editor from "../../components/page/Editor";
import NotificationStore from "../../store/Notification";
import crossuser from "../../utils/crossuser";
import withStores from "../../store/withStores";
import FileUndoIcon from "mdi-react/FileUndoIcon";
import PackageVariantIcon from "mdi-react/PackageVariantIcon";
import A from "../../components/system/A";

export default withStores(NotificationStore, injectIntl(class PagePage extends React.PureComponent {
  constructor(p) {
    super(p);
    this.onChange = this.onChange.bind(this);
    this.onPreview = this.onPreview.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onChangeForm = this.onChangeForm.bind(this);
    this.saveStash = this.saveStash.bind(this);
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
    const stash = this.getStash();
    if (stash) {
      this.promptForStash(stash);
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

  onChangeForm(values) {
    this.setState(values, this.saveStash);
  }

  onChange(elements) {
    this.setState({ elements }, this.saveStash);
  }

  /**
   * Prompts the user to apply a given stash.
   * @param {{}} stash The stash to possibly apply.
   */
  promptForStash(stash) {
    this.props.notificationStore.push({
      timeout: 0,
      type: "info",
      icon: PackageVariantIcon,
      title: (<FormattedMessage id="page.editor.stash.title" />),
      children: (<div>
        <p><FormattedMessage id="page.editor.stash.hint" /></p>
        <p><FormattedMessage id="title" />: <em>{stash.data.title}</em> (<FormattedRelative value={stash.date} />)</p>
      </div>),
      buttons: [{
        _id: "apply",
        type: "success",
        text: (<span><PackageVariantIcon className="mdi-icon-spacer" /><FormattedMessage id="apply" /></span>),
        action: () => this.setState(stash.data, () => this.saveStash(stash.data))
      }, {
        _id: "discard",
        type: "danger",
        text: (<span><FileUndoIcon className="mdi-icon-spacer" /><FormattedMessage id="discard" /></span>),
        action: () => this.deleteStash(stash._id)
      }]
    });
  }

  /**
   * Gets the key of the stash in local storage.
   * @param {string} _id The ID of the stash. By default the current one is used.
   */
  getStashKey(_id = this.state._id) {
    return "page-stash:" + (_id || "$new");
  }

  /** 
   * Gets the stash in local storage.
   * @param {string} _id The ID of the stash. By default the current one is used.
   * @return {{} | null} Gets the stash, or null if none could be found.
   */
  getStash(_id = this.state._id) {
    const str = localStorage.getItem(this.getStashKey(_id));
    return str ? JSON.parse(str) : null;
  }

  /** 
   * Saves the given data to stash. The key of the stash is based on the `_id` 
   * property in the given data.
   * @param {{}} data The data to save. By default the current state is used.
   */
  saveStash(data = this.state) {
    localStorage.setItem(this.getStashKey(data._id), JSON.stringify({ data, date: new Date().toISOString() }));
  }

  /** 
   * Deletes the stash in local storage.
   * @param {string} _id The ID of the stash. By default the current one is used.
   */
  deleteStash(_id = this.state._id) {
    localStorage.removeItem(this.getStashKey(_id));
  }

  onPublish = ({ title, notes, path }) => {
    const { _id, elements } = this.state;
    const data = { _id, title, elements, notes, path };
    const promise = _id ? axios.put(`/api/page/${_id}`, data) : axios.post("/api/page", data);
    promise
      .then(({ data }) => {
        this.deleteStash(_id);
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
            onChange={this.onChangeForm}
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
