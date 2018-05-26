import A from "./A";
import Card from "./Card";
import { render, defaultRules } from "../slate-renderer";

export default ({ id, author, date, title, content, edit, onChange }) => (
  <Card
    image={`/static/content/avatars/${author}.png`}
    title={<A href={`/post/${id}`}>{title}</A>}
    subtitle={<><A href={`/about/${author}`}>@{author}</A> on {date.toLocaleString()}</>}>
    <div>
      <div>{render(defaultRules, content)}</div>
      {buttons(edit) && (<div className="push-12">
        <A className="button is-link" href={`/admin/post/${id}`}>Edit Post</A>
      </div>)}
    </div>
  </Card>
);

const buttons = (edit) => edit ? !edit.indexOf("show-admin-buttons") : false;