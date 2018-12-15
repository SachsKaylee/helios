import A from "../system/A";
import Card from "../layout/Card";
import { FormattedMessage } from "react-intl";

const buttons = (edit) => edit ? !edit.indexOf("show-admin-buttons") : false;

const Post = ({ _id, author, date, title, content, edit, tags, notes }) => (
  <>
    <Card
      image={`/api/avatar/${author}`}
      title={<A href={`/post/${_id}`}>{title}</A>}
      subtitle={<FormattedMessage id="post.subtitle" values={{
        author: <A href={`/about/${author}`}>{author}</A>,
        date
      }} />}>
      <div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {tags && tags.length ? (<div className="tags">{tags.map(tag => (<span className="tag" key={tag}>
          <A href={`/tag/${encodeURIComponent(tag)}`}>{tag}</A>
        </span>))}</div>) : null}
      </div>
    </Card>
    <div className="push-12">
      {notes ? (<p className="is-size-7 has-text-grey margin-2">{notes}</p>) : null}
      {buttons(edit) && (<A className="button is-link" href={`/admin/post/${_id}`}><FormattedMessage id="edit" /></A>)}
    </div>
  </>
);

export default Post;