/**
 * A simplified serializer for Slate values. Why do we need a simple one? The slate-html-serializer 
 * also includes Slate itself. The point of using a HTML serializer is to save us from including 
 * Slate itself in the Client bundle to save bandwidth & parsing time.
 * 
 * We also do not need deserilization capabilities as we only ever serialize to HTML. For actual 
 * editing we still use the Slate Editor itself, which produces JSON.
 */
export const textRule = {
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

export const serialize = (rules, value) => {
  if (!value) return undefined;
  const { document } = value;
  const elements = document.nodes.map(node => serializeNode(rules, node)).filter(el => el);
  return elements;
}

const serializeNode = (rules, node) => {
  if (node.object === 'text') {
    return node.leaves.map(leaf => serializeLeaf(rules, leaf));
  }
  const children = node.nodes.map(node => serializeNode(rules, node));
  return serializeSingle(rules, node, children, { key: getKey() });
}

const serializeLeaf = (rules, leaf) => {
  const string = { object: 'string', text: leaf.text };
  const text = serializeString(rules, string);
  return leaf.marks.reduce((children, mark) => serializeSingle(rules, mark, children, { key: getKey() }), text);
}

const serializeString = (rules, string) => serializeSingle(rules, string, string.text);

export const serializeSingle = (rules, obj, children, attributes) => {
  for (const rule of rules) {
    if (!rule.serialize) continue;
    const ret = rule.serialize(obj, children, attributes);
    if (ret === null) return;
    if (ret) return ret;
  }
  throw new Error(`No serializer defined for mark of type "${obj.type}".`);
}

const getKey = () => getKey.$key++;
getKey.$key = 0;