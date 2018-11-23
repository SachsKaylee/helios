const withStores = (stores, Component) =>
  (Array.isArray(stores) ? stores : [stores]).reduce((CurrentComponent, Store) => props => (<Store>
    {value => (<CurrentComponent {...{ [Store.name]: value }} {...props} />)}
  </Store>), Component);

export default withStores;
