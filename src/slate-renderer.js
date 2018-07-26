const html = require("./simple-html-serializer");
const A = require("./components/A").default;
const config = require("./config/client");

export const postRules = (opts = {}) => defaultRules({
  HeadingOne: ({ children, ...attributes }) => (<h3 className="title is-3" {...attributes}>{children}</h3>),
  HeadingTwo: ({ children, ...attributes }) => (<h4 className="title is-4" {...attributes}>{children}</h4>),
  Code: ({ children, ...attributes }) => (<code className="editor-el editor-el-code" {...attributes}>{children}</code>),
  Link: ({ children, ...attributes }) => (attributes.href.startsWith("https://" + config.domains[0])
    ? <A className="editor-el editor-el-link" {...attributes}>{children}</A>
    : <a className="editor-el editor-el-link" {...attributes}>{children}</a>),
  ...opts
});

export const defaultRules = ({
  HeadingOne = "h1",
  HeadingTwo = "h2",
  Code = "code",
  Link = "a"
} = {}) => [
    html.textRule,
    // Serialize Blocks
    {
      serialize(obj, children, attributes) {
        if (obj.object == "block") {
          switch (obj.type) {
            case "line": return (<p {...attributes}>{children}</p>);
            case "heading-one": return (<HeadingOne {...attributes}>{children}</HeadingOne>);
            case "heading-two": return (<HeadingTwo {...attributes}>{children}</HeadingTwo>);
            case "block-quote": return (<blockquote {...attributes}>{children}</blockquote>);
            case "bulleted-list": return (<ul {...attributes}>{children}</ul>);
            case "numbered-list": return (<ol {...attributes}>{children}</ol>);
            case "list-item": return (<li {...attributes}>{children}</li>);
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
    // Serialize Inlines
    {
      serialize(obj, children, attributes) {
        if (obj.object == "inline") {
          switch (obj.type) {
            case "link": return (<Link {...attributes} href={obj.data.href}>{children}</Link>);
          }
        }
      }
    },
    // Error Fallback
    {
      serialize: (obj, children, attributes) => {
        console.error("Unknown slate element:", obj.object, obj.type);
        return (<span className="editor-el editor-el-error" {...attributes}>
          Unknown {obj.object}: {obj.type} ({children.length} children)
        </span>);
      }
    }
  ]

export const render = (rules, value, options) => html.serialize(rules, value, options);
export const Renderer = ({ rules, options, children }) => html.serialize(rules, children, options) || null;