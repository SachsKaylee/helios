import A from "./../A";
import Card from "./../Card";
import Editor from './../EditorRichText';
import { FormattedMessage } from "react-intl";
import SoftBreak from "slate-soft-break";

const contentPlugins = [
  SoftBreak({
    onlyIn: ["block-quote"],
    shift: true
  })
]
const titlePlugins = [
]

const EditablePost = ({ author, date, title, content, onChange }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={undefined} style={{ cursor: "text" }}>
      <Editor
        autoCorrect={true}
        onChange={onChange("title")}
        plugins={titlePlugins}
        value={title} />
    </A>}
    subtitle={<FormattedMessage id="post.subtitle" values={{
      author: <A href={undefined}>{author}</A>,
      date
    }} />}>
    <div>
      <Editor
        autoFocus={true}
        autoCorrect={true}
        onChange={onChange("content")}
        plugins={contentPlugins}
        value={content} />
    </div>
  </Card>
);

export default EditablePost;
