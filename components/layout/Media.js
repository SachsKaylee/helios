const Media = ({ image, title, children, className, style }) => (
  // todo: render to a shorter version, not the entire post!
  <article className={"media " + className} style={style}>
    {image && (<figure className="media-left">
      <p className="image is-64x64">
        <img src={image} />
      </p>
    </figure>)}
    <div className="media-content">
      <div className="content">
        {title && (<div>{title}<br /></div>)}
        {children}
      </div>
    </div>
  </article>);

export default Media;