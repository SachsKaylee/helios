import A from "./../A";
import Card from "./../Card";
import { Renderer, postRules } from "../../slate-renderer";
import { FormattedMessage } from "react-intl";

const buttons = (edit) => edit ? !edit.indexOf("show-admin-buttons") : false;

const rules = postRules();

const ReadOnlyPost = ({ id, author, date, title, content, edit }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={`/post/${id}`}>{title}</A>}
    subtitle={<FormattedMessage id="post.subtitle" values={{
      author: <A href={`/about/${author}`}>{author}</A>,
      date
    }} />}>
    <div>
      <Renderer rules={rules}>{content}</Renderer>
      {buttons(edit) && (<div className="push-12">
        <A className="button is-link" href={`/admin/post/${id}`}><FormattedMessage id="edit" /></A>
      </div>)}
    </div>
  </Card>
);

export default ReadOnlyPost;