import A from "./../system/A";
import Card from "../layout/Card";
import EditorRichText from './../EditorRichText';
import { FormattedMessage } from "react-intl";

const EditablePost = ({ author, date, title, content, onChange }) => (
  <Card
    image={`/api/avatar/${author}`}
    title={<A href={undefined} style={{ cursor: "text" }}>
      <input className="input" type="text" 
        onChange={e => onChange("title")(e.target.value)}
        value={title} />
    </A>}
    /*subtitle={<FormattedMessage id="post.subtitle" values={{
      author: <A href={undefined}>{author}</A>,
      date
    }} />}*/>
    <div>
      <EditorRichText
        onChange={onChange("content")}
        value={content} 
        config={{
          filebrowser: {
           ajax: {
             url: "/api/files/browser"
           } 
          }
        }}/>
    </div>
  </Card>
);

export default EditablePost;
