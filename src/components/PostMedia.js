import A from "./A";
import { render, defaultRules } from "../slate-renderer";

const PostMedia = (post) => (
  // todo: render to a shorter version, not the entire post!
  <article className="media">
    <figure className="media-left">
      <p className="image is-64x64">
        <img src={`/api/avatar/${post.author}`} />
      </p>
    </figure>
    <div className="media-content">
      <div className="content">
        <p>
          <strong><A href={`/post/${post._id}`}>{post.title}</A></strong> <small>{new Date(post.date).toLocaleString()}</small>
          <br />
          {render(defaultRules, post.content)}
      </p>
      </div>
    </div>
  </article>);

export default PostMedia;