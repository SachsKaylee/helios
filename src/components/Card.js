const classNames = require("classnames");

export default ({ compactY, compactX, image, title, subtitle, children }) => (
  <div className="card" style={{ marginTop: compactY ? "1em" : "6em" }}>
    <div className="card-content">
      <div className="media">
        {image && (<div className="media-center">
          <img src={image.src || image} className="top-image" alt={image.alt || image} />
        </div>)}
        {(title || subtitle) && (<div className="media-content has-text-centered">
          {title && (<div className="title card-title">{title}</div>)}
          {subtitle && (<p className="subtitle is-6 card-subtitle">{subtitle}</p>)}
        </div>)}
      </div>
      <div className={classNames("content", !compactX && "card-body")}>{children}</div>
    </div>
    <style jsx>
      {`
    .content p {
        line-height: 1.9;
        margin: 15px 0;
    }
    .top-image {
        position: absolute;
        top: -30px;
        left: 50%;
        width: 60px;
        height: 60px;
        margin-left: -30px;
        border: 3px solid #ccc;
        border-radius: 50%;
        background-color: white;
    }
    .media-center {
      display: block;
      margin-bottom: 1rem;
    }
    .media-content {
      margin-top: 3rem;
    }
    .card-title {
      font-size: 2rem;
      font-weight: lighter;
      line-height: 2;
    }
    .card-subtitle {
      color: #909AA0;
      margin-bottom: 3rem;
    }
    .card-body {
      line-height: 1.4;
      margin: 0 6rem;
    }`}
    </style>
  </div>);