import A from "./A";
import Card from "./Card";
import Editor from './EditorRichText';

const createEditor = ({ edit, value, name, onChange }) => (<Editor
  readOnly={readonly(edit)}
  value={value}
  onChange={onChange && onChange(name)} />);

export default ({ id, author, date, title, content, edit, onChange }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={readonly(edit) ? `/post/${id}` : undefined}>{createEditor({ edit, onChange, value: title, name: "title" })}</A>}
    subtitle={<><A href={readonly(edit) ? `/about/${author}` : undefined}>@{author}</A> on {date.toLocaleString()}</>}>
    <div>
      {createEditor({ edit, onChange, value: content, name: "content" })}
      {buttons(edit) && (<div className="push-12">
        <A className="button is-link" href={`/admin/post/${id}`}>Edit Post</A>
      </div>)}
    </div>
  </Card>
);

const readonly = (edit) => edit ? !!edit.indexOf("allow-content-editing") : true;
const buttons = (edit) => edit ? !edit.indexOf("show-admin-buttons") : false;