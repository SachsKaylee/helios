const html = require("./simple-html-serializer");

// todo: allow us to re-use these rules in the EditorRichText component

const defaultRules = [
  html.textRule,
  // Serialize Blocks
  {
    serialize(obj, children) {
      if (obj.object == "block") {
        switch (obj.type) {
          case "line": return (<p>{children}</p>);
          case "block-quote": return (<blockquote>{children}</blockquote>);
          case "bulleted-list": return (<ul>{children}</ul>);
          case "heading-one": return (<h1>{children}</h1>);
          case "heading-two": return (<h2>{children}</h2>);
          case "list-item": return (<li>{children}</li>);
          case "numbered-list": return (<ol>{children}</ol>);
        }
      }
    }
  },
  // Serialize Marks
  {
    serialize(obj, children) {
      if (obj.object == "mark") {
        switch (obj.type) {
          case "bold": return (<strong>{children}</strong>);
          case "code": return (<code>{children}</code>);
          case "italic": return (<em>{children}</em>);
          case "underlined": return (<u>{children}</u>);
        }
      }
    }
  }
]

export const render = rules => (value, options) => html.serialize(rules, value, options);
export const renderDefault = render(defaultRules);