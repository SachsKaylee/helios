import React from 'react';
import classnames from 'classnames';

class HeroPage extends React.PureComponent {
  render() {
    const currentVariant = this.props.variant || "default";
    return (<section className={classnames("hero", "is-" + currentVariant)}>
      <div className="hero-body">
        <div className="container">
          <h1 className="title">
            {this.props.title}
          </h1>
          <h2 className="subtitle">
            {this.props.subtitle}
          </h2>
        </div>
      </div>
    </section>);
  }
}

export default HeroPage;
