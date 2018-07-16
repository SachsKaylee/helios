import EditorRichText, { dataToValue } from "../EditorRichText";
import EditorToolbar from "../EditorToolbar";
import SoftBreak from "slate-soft-break";

const plugins = [
  SoftBreak({
    onlyIn: ["block-quote"],
    shift: true
  })
];

const FormFieldRichText = ({ keyName, name, ignoreData, placeholder, form, waiting }) => {
  const key = keyName;
  const meta = form.getFieldMeta(key);
  const data = dataToValue(meta ? meta.value : ignoreData ? undefined : form.getData(key));
  const change = ({ value }) => !waiting && form.setFieldMeta(key, { value });
  return (<div className="field" key={key}>
    <label className="label">{name}</label>
    <div className="contol">
      <div className="columns">
        <div className="column is-three-quarters">
          <EditorRichText
            plugins={plugins}
            readOnly={waiting}
            className="textarea"
            style={{ overflowY: "auto" }}
            placeholder={placeholder}
            value={data}
            onChange={change} />
        </div>
        <div className="column">
          <EditorToolbar
            onChange={change}
            value={data}
            stylesChooser={true} />
        </div>
      </div>
    </div>
    {form.renderValidationResult(form.getValidationResult(key))}
  </div>);
};

export default FormFieldRichText;