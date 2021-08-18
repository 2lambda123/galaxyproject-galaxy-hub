// The index (in root's children) of the first node of the table of contents.
const TOC_START = 0;
// The number of top-level nodes (children of root) that comprise the table of contents (excluding
// the ending header).
const TOC_SIZE = 2;
const HEADING_TEXT = 'table-of-contents';
const HEADING_ENDING = 'end-table-of-contents';

/**
 * Table of contents remodeling plugin.
 * @param {Object} [opts] Options.
 * @param {Object} [opts.tocAttrs]  Values for any HTML attributes to insert into the `<div>
 *   wrapping the table of contents. WARNING: The values are inserted literally between double
 *   quotes into the string, so mind the content.
 * @param {Object} [opts.bodyAttrs] Same as `opts.tocAttrs` but for the body wrapper.
 */
export default function attacher(opts) {
  if (opts === undefined) {
    opts = {};
  }
  function transformer(tree, file) {
    if (hasToc(tree)) {
      removeNode(tree, 'heading', HEADING_TEXT);
      removeNode(tree, 'heading', HEADING_ENDING);
      // Wrap the ToC
      wrapNodes(tree, TOC_START, TOC_SIZE-1, opts.tocAttrs);
      // Wrap the body
      wrapNodes(tree, TOC_START+TOC_SIZE+1, tree.children.length, opts.bodyAttrs);
    }
  }
  return transformer;
}

function hasToc(tree) {
  if (tree.children.length < 2) {
    return false;
  }
  let heading = tree.children[0];
  let list = tree.children[1];
  if (! (heading.type === 'heading' && heading.data && heading.data.id === 'table-of-contents')) {
    return false;
  }
  if (! (list.type === 'list')) {
    return false;
  }
  return true;
}

function removeNode(tree, nodeType, idText) {
  for (let i in tree.children) {
    let node = tree.children[i];
    if (node.type === nodeType && node.data && node.data.id === idText) {
      tree.children.splice(i,1);
      return;
    }
  }
}

function wrapNodes(tree, start, end, wrapperAttrs={}) {
  let wrapperStart = {
    type: 'html',
    value: makeTag('div', wrapperAttrs),
  };
  let wrapperEnd = {
    type: 'html',
    value: '</div>',
  };
  tree.children.splice(start,0,wrapperStart);
  tree.children.splice(end+1,0,wrapperEnd);
}

function makeTag(tagName, attrs) {
  let tag = '<'+tagName;
  Object.entries(attrs)
    .map(([attr,value]) => `${attr}="${value}"`)
    .forEach(attrStr => tag += ' '+attrStr);
  tag += '>';
  return tag;
}
