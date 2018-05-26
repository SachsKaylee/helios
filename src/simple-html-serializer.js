/**
 * A simplified serializer for Slate values. Why do we need a simple one? The slate-html-serializer 
 * also includes Slate itself. The point of using a HTML serializer is to save us from including 
 * Slate itself in the Client bundle to save bandwidth & parsing time.
 * 
 * We also do not need deserilization capabilities as we only ever serialize to HTML. For actual 
 * editing we still use the Slate Editor itself, which produces JSON.
 */
const React = require('react');
const ReactDOMServer = require('react-dom/server');

/**
 * A rule to (de)serialize text nodes.
 *
 * @type {Object}
 */

const textRule = {
  serialize(obj, children) {
    if (obj.object === 'string') {
      return children.split('\n').reduce((array, text, i) => {
        if (i != 0) array.push(<br key={i} />);
        array.push(text);
        return array;
      }, []);
    }
  },
}

const serialize = (rules, value, options = {}) => {
  const { document } = value;
  const elements = document.nodes.map(node => serializeNode(rules, node)).filter(el => el);
  if (options.render === false) return elements;

  const html = ReactDOMServer.renderToStaticMarkup(<body>{elements}</body>);
  const inner = html.slice(6, -7);
  return inner;
}

const serializeNode = (rules, node) => {
  console.log("Serialize", node)
  if (node.object === 'text') {
    return node.leaves.map(leaf => serializeLeaf(rules, leaf));
  }
  const children = node.nodes.map(node => serializeNode(rules, node));
  for (const rule of rules) {
    if (!rule.serialize) continue;
    const ret = rule.serialize(node, children);
    if (ret === null) return;
    if (ret) return addKey(ret);
  }
  console.error("errnode -- ", node);
  throw new Error(`No serializer defined for node of type "${node.type}".`);
}

const serializeLeaf = (rules, leaf) => { // todo: check if we actually need the immutable.js record?
  const string = { object: 'string', text: leaf.text };
  const text = serializeString(rules, string);
  return leaf.marks.reduce((children, mark) => {
    for (const rule of rules) {
      if (!rule.serialize) continue;
      const ret = rule.serialize(mark, children);
      if (ret === null) return;
      if (ret) return addKey(ret);
    }
    console.error("errnode -- ", node);
    throw new Error(`No serializer defined for mark of type "${mark.type}".`);
  }, text);
}

const serializeString = (rules, string) => {
  for (const rule of rules) {
    if (!rule.serialize) continue;
    const ret = rule.serialize(string, string.text);
    if (ret) return ret;
  }
}

const addKey = element => React.cloneElement(element, { key: addKey.$key++ });
addKey.$key = 0;

module.exports = { textRule, serialize };