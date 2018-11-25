import React from 'react';

const withStores = (stores, Component) => {
  stores = Array.isArray(stores) ? stores : [stores];
  return class extends React.PureComponent {
    static displayName = `WithStores(${Component.displayName})`;

    static async getInitialProps(...args) {
      return Component.getInitialProps(...args);
    }

    render() {
      return stores.reduce((CurrentComponent, Store) => (<Store>
        {value => (<CurrentComponent {...{ [Store.name]: value }} {...this.props} />)}
      </Store>), Component);
    }
  }
}

export default withStores;
