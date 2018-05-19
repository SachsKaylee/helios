import A from "./A";
import Card from "./Card";
import Editor from './EditorRichText';

const createEditor = ({ allowEdit, value, name, onChange }) => (<Editor
  readOnly={!allowEdit}
  value={value}
  onChange={onChange && onChange(name)}/>);

export default ({ id, author, avatar, date, title, content, allowEdit, onChange }) => (
  <Card compactY
    image={avatar}
    title={<A href={!allowEdit ? `/post/${id}` : undefined}>{createEditor({ allowEdit, onChange, value: title, name: "title" })}</A>}
    subtitle={<><A href={!allowEdit ? `/about/${author}` : undefined}>@{author}</A> on {date.toLocaleString()}</>}>
    {createEditor({ allowEdit, onChange, value: content, name: "content" })}
  </Card>
);