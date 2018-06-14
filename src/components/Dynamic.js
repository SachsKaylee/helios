import React from "react";
import { FormattedMessage } from "react-intl";

class Dynamic extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      state: "loading",
      Loaded: undefined
    }
  }

  componentDidMount() {
    const { loader } = this.props.dynamic;
    loader
      .then(Loaded => this.setState({ Loaded, state: "loaded" }))
      .catch(error => this.setState({ error, state: "error" }));
  }

  render() {
    const { state } = this.state;
    switch (state) {
      case "loading": return (<FormattedMessage id="loading" />); // todo: customizable
      case "error": return (<FormattedMessage id="error" />); // todo: customizable
      case "loaded": return this.renderLoaded();
    }
  }

  renderLoaded() {
    const { dynamic, props } = this.props;
    const { Loaded } = this.state;
    return dynamic.render
      ? dynamic.render(Loaded)
      : (<Loaded {...props} />);
  }
}

export default Dynamic;