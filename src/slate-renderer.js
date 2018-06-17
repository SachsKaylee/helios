const html = require("./simple-html-serializer");

export const defaultRules = [
  html.textRule,
  // Serialize Blocks
  {
    serialize(obj, children, attributes) {
      if (obj.object == "block") {
        switch (obj.type) {
          case "line": return (<p {...attributes}>{children}</p>);
          case "block-quote": return (<blockquote {...attributes}>{children}</blockquote>);
          case "bulleted-list": return (<ul {...attributes}>{children}</ul>);
          case "heading-one": return (<h1 {...attributes}>{children}</h1>);
          case "heading-two": return (<h2 {...attributes}>{children}</h2>);
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
          case "code": return (<code className="editor-el editor-el-code" {...attributes}>{children}</code>);
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