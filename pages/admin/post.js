import Columns from "../../components/layout/Columns";
import A from "../../components/system/A";
import React from "react";
import Card from "../../components/layout/Card"
import EditablePost from "../../components/post/PostEditor";
import axios from "axios";
import NotificationStore from "../../store/Notification";
import withStores from "../../store/withStores";
import { FormattedMessage, injectIntl, FormattedRelative } from "react-intl";
import config from "../../config/client";
import DeleteIcon from "mdi-react/DeleteIcon";
import TrashIcon from "mdi-react/TrashIcon";
import CakeIcon from "mdi-react/CakeIcon";
import PackageVariantIcon from "mdi-react/PackageVariantIcon";
import PostForm from "../../components/forms/PostForm";
import crossuser from "../../utils/crossuser";
import FileUndoIcon from "mdi-react/FileUndoIcon";

export default withStores(NotificationStore, injectIntl(class PostPage extends React.PureComponent {
  constructor(p) {
    super(p);
    this.state = {
      ...defaultPostData(),
      ...p.data
    };
    this.onChangeForm = this.onChangeForm.bind(this);
    this.saveStash = this.saveStash.bind(this);
  }

  static async getInitialProps({ query, req }) {
    const opts = crossuser(req);
    const { data: tags } = await axios.get("/api/tag", opts);
    if (query.id) {
      const { data } = await axios.get(`/api/post/${query.id}`, opts);
      return { data };
    } else {
      const { data } = await axios.get("/api/session", opts);
      return {
        tags, data: {
          author: data.id
        }
      };
    }
  }

  componentDidMount() {
    if (this.state._id) {
      const title = this.props.intl.formatMessage({ id: "post.title.edit" }, { title: this.state.title })
      this.props.setPageTitle(title);
    } else {
      const title = this.props.intl.formatMessage({ id: "post.title.new" });
      this.props.setPageTitle(title);
    }
    const stash = this.getStash();
    if (stash) {
      this.promptForStash(stash);
    }
  }

  onChange = what => (value) => {
    this.setState({ [what]: value }, this.saveStash);
  }

  onChangeForm(form) {
    this.setState({ ...form }, this.saveStash);
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
      title: (<FormattedMessage id="post.editor.stash.title" />),
      children: (<div>
        <p><FormattedMessage id="post.editor.stash.hint" /></p>
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
    return "post-stash:" + (_id || "$new");
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

  onDelete = (really) => () => {
    if (really) {
      const { _id } = this.state;
      axios.delete(`/api/post/${_id}`).then(() => {
        this.setState({
          _id: undefined,
          date: new Date()
        }, () => {
          this.props.notificationStore.push({
            type: "success",
            icon: DeleteIcon,
            title: (<FormattedMessage id="post.editor.notification.deleted.title" />),
            children: (<FormattedMessage id="post.editor.notification.deleted.description" />)
          });
        });
      }).catch(error => this.props.notificationStore.pushError(error));
    } else {
      this.props.notificationStore.push({
        type: "danger",
        icon: TrashIcon,
        title: (<FormattedMessage id="post.editor.notification.delete.title" />),
        children: (<FormattedMessage id="post.editor.notification.delete.description" />),
        buttons: [
          {
            text: (<FormattedMessage id="post.editor.notification.delete.confirm" />),
            action: this.onDelete(true)
          }
        ]
      });
    }
  }

  onPublish = ({ tags, notes }) => {
    const { _id, title, content, date, author } = this.state;
    const data = {
      author, date, tags, notes,
      title: title,
      content: content
    };
    const promise = _id ? axios.put(`/api/post/${_id}`, data) : axios.post("/api/post", data);
    promise
      .then(({ data }) => {
        this.deleteStash(_id);
        this.setState(data, () => {
          this.props.notificationStore.push({
            type: "success",
            icon: CakeIcon,
            title: (<FormattedMessage id="post.editor.notification.published.title" values={{
              link: (<A href={`/post/${data._id}`}>{data.title}</A>)
            }} />),
            children: (<FormattedMessage id="post.editor.notification.published.description" values={{
              link: (<A href={`/post/${data._id}`}>{data.title}</A>)
            }} />)
          });
        })
      })
      .catch(error => this.props.notificationStore.pushError(error));
  }

  renderDeleteSuccessNotification() {
    return (<div>
      <p className="subtitle">
        <DeleteIcon className="mdi-icon-spacer" />
        <FormattedMessage id="post.editor.notification.deleted.title" />
      </p>
      <p>
        <FormattedMessage id="post.editor.notification.deleted.description" />
      </p>
    </div>);
  }

  render() {
    const { _id, title, content, date, author, tags, notes } = this.state;
    return (
      <div className="container">
        <Columns size={3} sidebar={(
          <div className="sidebar">
            <Card>
              <PostForm
                tags={tags}
                notes={notes}
                allTags={this.state.allTags}
                onChange={this.onChangeForm}
                onPublish={this.onPublish}
                onDelete={_id ? this.onDelete(false) : undefined}
              />
            </Card>
          </div>)}>
          <EditablePost
            author={author}
            avatar={`/api/avatar/${author}`}
            content={content}
            date={date}
            title={title}
            onChange={this.onChange}
          />
        </Columns>
      </div>
    );
  }
}));

const defaultPostData = () => ({
  tags: config.defaultTags,
  title: config.locale.post.defaults.title,
  content: config.locale.post.defaults.description
});
