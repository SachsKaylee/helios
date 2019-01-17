import A from "../system/A";
import Card from "../layout/Card";
import { FormattedMessage } from "react-intl";
import Media from "../layout/Media";

const Post = ({ _id, author, date, title, content, tags, notes, admin }) => (
  <>
    <Card
      image={`/api/avatar/${author}`}
      title={<A href={`/post/${_id}`}>{title}</A>}
      subtitle={<FormattedMessage id="post.subtitle" values={{
        author: <A href={`/about/${author}`}>{author}</A>,
        date: new Date(date)
      }} />}>
      <div>
        {admin && (<Media image={"/api/avatar"}>
          <div className="push-12">
            <p><FormattedMessage id="post.adminArea" /> <span>
              <A className="button is-link is-small is-outlined" href={`/admin/post/${_id}`}><FormattedMessage id="edit" /></A>
            </span></p>
            <p className="is-size-7 has-text-grey">{notes}</p>
          </div>
        </Media>)}
        <div className="user-content" dangerouslySetInnerHTML={{ __html: content }} />
        {tags && tags.length ? (<div className="tags">{tags.map(tag => (<span className="tag" key={tag}>
          <A href={`/tag/${encodeURIComponent(tag)}`}>{tag}</A>
        </span>))}</div>) : null}
      </div>
    </Card>
  </>
);

export default Post;
