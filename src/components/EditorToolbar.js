import React from 'react'
import ReactTooltip from 'react-tooltip';
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlineIcon, CodeBracesIcon, FormatHeader1Icon, FormatHeader2Icon, FormatQuoteOpenIcon, FormatListBulletedIcon, FormatListNumberedIcon, LinkVariantIcon } from 'mdi-react';
import { FormattedMessage } from 'react-intl';
import textContent from "react-addons-text-content";

const DEFAULT_NODE = "line";

export default class EditorToolbar extends React.Component {
  insertLink = (phase) => {
    const { editor } = this.props;
    if (editor.current) {
      if (phase === "change" && !this.hasInline("link")) {
        const href = prompt("Please enter the target of your link...", window.location.href.replace("/admin/post/", "/post/"));
        if (!href) return;
        if (!editor.current.value.selection.isCollapsed) return editor.current.wrapInline({ type: "link", data: { href } });
        const text = prompt("Please enter the text of your link...", href);
        if (!text) return;
        return editor.current.insertInline({ type: "link", data: { href }, nodes: [{ object: "text", text }] });
      }
    }
  }

  render() {
    const { stylesChooser } = this.props;
    return (<div>
      <ReactTooltip id="editor-toolbar" effect="solid" />
      {stylesChooser && (<div>
        <label className="label"><FormattedMessage id="editor.formatSelection" /></label>
        {this.renderMarkButton('bold', <FormatBoldIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.bold" />)}
        {this.renderMarkButton('italic', <FormatItalicIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.italic" />)}
        {this.renderMarkButton('underlined', <FormatUnderlineIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.underlined" />)}
        {this.renderMarkButton("code", <CodeBracesIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.code" />)}
        {this.renderInlineButton("link", <LinkVariantIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.link" />, this.insertLink)}
      </div>)}
      {stylesChooser && (<div>
        <label className="label"><FormattedMessage id="editor.formatParagraph" /></label>
        {this.renderBlockButton('heading-one', <FormatHeader1Icon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.headline1" />)}
        {this.renderBlockButton('heading-two', <FormatHeader2Icon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.headline2" />)}
        {this.renderBlockButton('block-quote', <FormatQuoteOpenIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.quote" />)}
        {this.renderBlockButton('numbered-list', <FormatListBulletedIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.numberedList" />)}
        {this.renderBlockButton('bulleted-list', <FormatListNumberedIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.bulletedList" />)}
        {this.renderBlockButton("code-block", <CodeBracesIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.code" />)}
      </div>)}
    </div>);
  }

  hasMark = type => {
    const { editor } = this.props;
    if (!editor.current) {
      return false;
    }
    return editor.current.value.activeMarks.some(mark => mark.type == type)
  }

  hasBlock = type => {
    const { editor } = this.props;
    if (!editor.current) {
      return false;
    }
    return editor.current.value.blocks.some(node => node.type == type)
  }

  hasInline = type => {
    const { editor } = this.props;
    if (!editor.current) {
      return false;
    }
    return editor.current.value.inlines.some(node => node.type == type);
  }

  onClickMark = (event, type) => {
    event.preventDefault()
    const { editor } = this.props;
    if (editor.current) {
      editor.current.toggleMark(type);
    }
  }

  onClickInline = (event, type, callback) => {
    event.preventDefault();
    const { editor } = this.props;
    if (editor.current) {
      if (callback) {
        callback("change");
      } else if(this.hasInline(type)) {
        editor.current.unwrapInline((callback && callback("unwrap")) || type);
      } else {
        editor.current.wrapInline((callback && callback("wrap")) || type);
      }
    }
  }

  componentDidMount() {
    setInterval(() => this.forceUpdate(), 10);
  }

  onClickBlock = (event, type) => {
    event.preventDefault();
    const { editor } = this.props;
    if (editor.current) {
      const value = editor.current.value;
      const { document } = value;

      // Handle everything but list buttons.
      if (type != 'bulleted-list' && type != 'numbered-list') {
        const isActive = this.hasBlock(type);
        const isList = this.hasBlock('list-item');

        if (isList) {
          editor.current
            .setBlocks(isActive ? DEFAULT_NODE : type)
            .unwrapBlock('bulleted-list')
            .unwrapBlock('numbered-list');
        } else {
          editor.current
            .setBlocks(isActive ? DEFAULT_NODE : type);
        }
      } else {
        // Handle the extra wrapping required for list buttons.
        const isList = this.hasBlock('list-item');
        const isType = value.blocks.some(block => {
          return !!document.getClosest(block.key, parent => parent.type == type)
        });

        if (isList && isType) {
          editor.current
            .setBlocks(DEFAULT_NODE)
            .unwrapBlock('bulleted-list')
            .unwrapBlock('numbered-list');
        } else if (isList) {
          editor.current
            .unwrapBlock(type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list')
            .wrapBlock(type);
        } else {
          editor.current
            .setBlocks('list-item')
            .wrapBlock(type);
        }
      }
    }
  }

  renderInlineButton = (type, icon, tooltip, callback) => {
    const isActive = this.hasInline(type);
    const onMouseDown = event => this.onClickInline(event, type, callback);

    return (
      <span className="icon" onMouseDown={onMouseDown} data-tip={textContent(tooltip)} data-for="editor-toolbar"
        style={isActive ? { border: "1px solid", borderRadius: 1, margin: 1 } : { margin: 1 }}>
        {icon}
      </span>
    )
  }

  renderMarkButton = (type, icon, tooltip) => {
    const isActive = this.hasMark(type);
    const onMouseDown = event => this.onClickMark(event, type);

    return (
      <span className="icon" onMouseDown={onMouseDown} data-tip={textContent(tooltip)} data-for="editor-toolbar"
        style={isActive ? { border: "1px solid", borderRadius: 1, margin: 1 } : { margin: 1 }}>
        {icon}
      </span>
    )
  }

  renderBlockButton = (type, icon, tooltip) => {
    const { editor } = this.props;
    if (editor.current) {
      let isActive = this.hasBlock(type);

      if (['numbered-list', 'bulleted-list'].includes(type)) {
        const firstBlock = editor.current.value.blocks.first();
        const parent = firstBlock && editor.current.value.document.getParent(firstBlock.key)
        isActive = parent && parent.type === type && this.hasBlock('list-item');
      }
      const onMouseDown = event => this.onClickBlock(event, type)

      return (
        <span className="icon" onMouseDown={onMouseDown} data-active={isActive} data-tip={textContent(tooltip)} data-for="editor-toolbar"
          style={isActive ? { border: "1px solid", borderRadius: 1, margin: 1 } : { margin: 1 }}>
          {icon}
        </span>
      )
    }
  }
}