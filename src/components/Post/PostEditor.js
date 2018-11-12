import A from "./../A";
import Card from "./../Card";
import EditorRichText from './../EditorRichText';
import { FormattedMessage } from "react-intl";

const EditablePost = ({ author, date, title, content, onChange }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={undefined} style={{ cursor: "text" }}>
      <input
        onChange={e => onChange("title")(e.target.value)}
        value={title} />
    </A>}
    subtitle={<FormattedMessage id="post.subtitle" values={{
      author: <A href={undefined}>{author}</A>,
      date
    }} />}>
    <div>
      <EditorRichText
        onChange={onChange("content")}
        value={content} />
    </div>
  </Card>
);

export default EditablePost;
