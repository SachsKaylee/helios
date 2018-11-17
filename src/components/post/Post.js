import A from "../system/A";
import Card from "../layout/Card";
import { FormattedMessage } from "react-intl";

const buttons = (edit) => edit ? !edit.indexOf("show-admin-buttons") : false;

const Post = ({ id, author, date, title, content, edit, tags, notes }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={`/post/${id}`}>{title}</A>}
    subtitle={<FormattedMessage id="post.subtitle" values={{
      author: <A href={`/about/${author}`}>{author}</A>,
      date
    }} />}>
    <div>
      <div dangerouslySetInnerHTML={{ __html: content }}/>
      {notes ? (<p className="is-size-7 has-text-grey">{notes}</p>) : null}
      {tags && tags.length ? (<div className="tags">{tags.map(tag => (<span className="tag" key={tag}>
        <A href={`/tag/${tag}`}>{tag}</A>
      </span>))}</div>) : null}
      {buttons(edit) && (<div className="push-12">
        <A className="button is-link" href={`/admin/post/${id}`}><FormattedMessage id="edit" /></A>
      </div>)}
    </div>
  </Card>
);

export default Post;
