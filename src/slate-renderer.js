const html = require("./simple-html-serializer");

export const postRules = (opts = {}) => defaultRules({
  HeadingOne: ({ children, ...attributes }) => (<h3 className="title is-3" {...attributes}>{children}</h3>),
  HeadingTwo: ({ children, ...attributes }) => (<h4 className="title is-4" {...attributes}>{children}</h4>),
  Code: ({ children, ...attributes }) => (<code className="editor-el editor-el-code" {...attributes}>{children}</code>),
  ...opts
});

export const defaultRules = ({
  HeadingOne = "h1",
  HeadingTwo = "h2",
  Code = "code"
} = {}) => [
    html.textRule,
    // Serialize Blocks
    {
      serialize(obj, children, attributes) {
        if (obj.object == "block") {
          switch (obj.type) {
            case "line": return (<p {...attributes}>{children}</p>);
            case "block-quote": return (<blockquote {...attributes}>{children}</blockquote>);
            case "bulleted-list": return (<ul {...attributes}>{children}</ul>);
            case "heading-one": return (<HeadingOne {...attributes}>{children}</HeadingOne>);
            case "heading-two": return (<HeadingTwo {...attributes}>{children}</HeadingTwo>);
            case "list-item": return (<li {...attributes}>{children}</li>);
            case "numbered-list": return (<ol {...attributes}>{children}</ol>);
          }
        }
      }
    },
    // Serialize Marks
    {
      serialize(obj, children, attributes) {
        if (obj.object == "mark") {
          switch (obj.type) {
            case "bold": return (<strong {...attributes}>{children}</strong>);
            case "code": return (<Code {...attributes}>{children}</Code>);
            case "italic": return (<em {...attributes}>{children}</em>);
            case "underlined": return (<u {...attributes}>{children}</u>);
          }
        }
      }
    },
    // Error Fallback
    {
      serialize: (obj, children, attributes) => (<pre className="editor-el editor-el-error" {...attributes}>
        Unknown element: {obj.type} ({children.length} children)
    </pre>)
    }
  ]

export const render = (rules, value, options) => html.serialize(rules, value, options);
export const Renderer = ({ rules, options, children }) => html.serialize(rules, children, options) || null;