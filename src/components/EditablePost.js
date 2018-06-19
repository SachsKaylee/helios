import A from "./A";
import Card from "./Card";
import Editor from './EditorRichText';
import { FormattedMessage } from "react-intl";

const createEditor = ({ value, name, onChange }) => (<Editor
  value={value}
  onChange={onChange && onChange(name)} />);

const EditablePost = ({ author, date, title, content, onChange }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={undefined} style={{ cursor: "text" }}>{createEditor({ onChange, value: title, name: "title" })}</A>}
    subtitle={<FormattedMessage id="post.subtitle" values={{
      author: <A href={undefined}>{author}</A>,
      date
    }} />}>
    <div>
      {createEditor({ onChange, value: content, name: "content" })}
    </div>
  </Card>
);

export default EditablePost;
