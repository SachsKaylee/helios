import A from "./A";
import Media from "./Media";
import { render, postRules } from "../slate-renderer";
import { FormattedMessage, FormattedDate } from "react-intl";

// todo: render to a shorter version, not the entire post!
const PostMedia = (post) => (<Media
  image={`/api/avatar/${post.author}`}
  title={(<FormattedMessage id="post.mediaTitle" values={{
    title: (<strong><A href={`/post/${post._id}`}>{post.title}</A></strong>),
    author: (<A href={`/about/${post.author}`}>{post.author}</A>),
    date: (<small><FormattedDate value={new Date(post.date)} year="numeric" month="long" day="numeric" weekday="long" /></small>)
  }} />)}>
  {render(postRules(), post.content)}
</Media>);

export default PostMedia;