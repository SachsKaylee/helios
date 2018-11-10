import A from "./../A";
import Card from "./../Card";
import EditorRichText from './../EditorRichText';
import { FormattedMessage } from "react-intl";
import SoftBreak from "slate-soft-break";
import PasteLinkify from "slate-paste-linkify";
import { postRules } from "../../slate-renderer";

const rules = postRules();
const contentPlugins = [
  SoftBreak({
    onlyIn: ["block-quote", "code-block"],
    shift: true
  }),
  PasteLinkify({
    type: "link"
  })
]
const titlePlugins = [
]

const EditablePost = ({ editorRef, author, date, title, content, onChange }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={undefined} style={{ cursor: "text" }}>
      <EditorRichText
        autoCorrect={true}
        onChange={onChange("title")}
        rules={rules}
        plugins={titlePlugins}
        value={title} />
    </A>}
    subtitle={<FormattedMessage id="post.subtitle" values={{
      author: <A href={undefined}>{author}</A>,
      date
    }} />}>
    <div>
      <EditorRichText
        autoFocus={true}
        autoCorrect={true}
        onChange={onChange("content")}
        rules={rules}
        plugins={contentPlugins}
        editorRef={editorRef}
        value={content} />
    </div>
  </Card>
);

export default EditablePost;
