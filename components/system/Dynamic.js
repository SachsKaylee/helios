import React from "react";
import { FormattedMessage } from "react-intl";

class Dynamic extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      state: "loading",
      loaded: undefined
    }
  }

  componentDidMount() {
    const { loader } = this.props.dynamic;
    loader()
      .then(loaded => this.setState({ loaded, state: "loaded" }))
      .catch(error => this.setState({ error, state: "error" }));
  }

  render() {
    const { state, error } = this.state;
    const { renderLoading, renderError } = this.props.dynamic;
    switch (state) {
      case "loading": return renderLoading ? renderLoading() : (<FormattedMessage id="loading" />);
      case "error": return renderError ? renderError(error) : (<FormattedMessage id="error" />);
      case "loaded": return this.renderLoaded();
    }
  }

  renderLoaded() {
    const { dynamic, ...props } = this.props;
    const { loaded } = this.state;
    const Loaded = processLoadedModule(loaded);
    return dynamic.render
      ? dynamic.render(Loaded)
      : (<Loaded {...props} />);
  }
}

const processLoadedModule = loaded => loaded.default || loaded._default || loaded; 

export const withDynamic = (loaders, Component) => props => {
  const loader = (() => {
    const arrayLoaders = Object
      .keys(loaders)
      .map(name => loaders[name]().then(loaded => ({ [name]: processLoadedModule(loaded) })));
    return Promise
      .all(arrayLoaders)
      .then(tuples => tuples.reduce((acc, loadedTuple) => ({ ...acc, ...loadedTuple }), {}));
  })
  const render = loaded => (<Component {...props} {...loaded} />);
  return (<Dynamic dynamic={{
    loader: loader,
    render: render,
    renderLoading: Component.renderLoading,
    renderError: Component.renderError
  }} />);
}

export default Dynamic;
