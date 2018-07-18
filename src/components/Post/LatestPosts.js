import React from "react";
import equal from "deep-equal";
import { get } from "axios";
import PostMedia from "./PostMedia";
import { FormattedMessage } from "react-intl";
import { SlimError } from "./../Error"; 

// todo: this is shit, we are not using SSR, which would be PERFECT for this. But the next.js devs don't want to support server data for nested components...
export default class LatestPosts extends React.PureComponent {
  constructor(p) {
    super(p);
    this.state = {
      posts: [],
      state: "loading"
    }
  }

  componentDidMount() {
    this.load(this.props);
  }

  componentDidUpdate(prevProps) {
    if (!equal(this.props, prevProps)) {
      this.load(this.props);
    }
  }

  load({ limit, ofUser }) {
    const url = ofUser ? `/api/posts-of/${ofUser}` : "/api/post"
    get(url, {
      params: {
        limit: limit
      }
    }).then(({ data }) => this.setState({ posts: data, state: "loaded" }))
      .catch(error => this.setState({ error: error.response.data, state: "error" }))
  }

  render() {
    const { state } = this.state;
    switch (state) {
      case "loading": return this.renderLoading();
      case "loaded": return this.renderLoaded();
      case "error": return this.renderError();
    }
  }

  renderLoading() {
    return (<div>  
      <FormattedMessage id="loading"/>
    </div>);
  }

  renderLoaded() {
    const { posts } = this.state;
    return posts && posts.length
      ? posts.map(post => (<PostMedia key={post._id} {...post} />))
      : (<FormattedMessage id="post.noneFound" />);
  }

  renderError() {
    const { error } = this.state;
    return (<SlimError error={error} />);
  }
}