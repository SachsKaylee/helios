import React from 'react'
import ReactTooltip from 'react-tooltip';
import classnames from "classnames";
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlineIcon, CodeBracesIcon, FormatHeader1Icon, FormatHeader2Icon, FormatQuoteOpenIcon, FormatListBulletedIcon, FormatListNumberedIcon, LinkVariantIcon } from 'mdi-react';
import { FormattedMessage } from 'react-intl';
import textContent from "react-addons-text-content";

const DEFAULT_NODE = "line";

export default class EditorToolbar extends React.Component {
  insertLink = (phase, value) => {
    if (phase === "change" && !this.hasInline("link")) {
      const href = prompt("Please enter the target of your link...", window.location.href.replace("/admin/post/", "/post/"));
      if (!href) return value.change();
      if (!value.selection.isCollapsed) return value.change().wrapInline({ type: "link", data: { href } });
      const text = prompt("Please enter the text of your link...", href);
      if (!text) return value.change();
      return value.change().insertInline({ type: "link", data: { href }, nodes: [{ object: "text", text }] });
    }
  }

  render() {
    const { stylesChooser, buttons } = this.props;
    return (<div>
      <ReactTooltip id="editor-toolbar" effect="solid" />
      {stylesChooser && (<div>
        <div className="margin-2"><span className="tag is-info"><FormattedMessage id="editor.formatSelection" /></span></div>
        {this.renderMarkButton('bold', <FormatBoldIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.bold" />)}
        {this.renderMarkButton('italic', <FormatItalicIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.italic" />)}
        {this.renderMarkButton('underlined', <FormatUnderlineIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.underlined" />)}
        {this.renderMarkButton("code", <CodeBracesIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.code" />)}
        {this.renderInlineButton("link", <LinkVariantIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.link" />, this.insertLink)}
      </div>)}
      {stylesChooser && (<div>
        <div className="margin-2"><span className="tag is-info"><FormattedMessage id="editor.formatParagraph" /></span></div>
        {this.renderBlockButton('heading-one', <FormatHeader1Icon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.headline1" />)}
        {this.renderBlockButton('heading-two', <FormatHeader2Icon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.headline2" />)}
        {this.renderBlockButton('block-quote', <FormatQuoteOpenIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.quote" />)}
        {this.renderBlockButton('numbered-list', <FormatListBulletedIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.numberedList" />)}
        {this.renderBlockButton('bulleted-list', <FormatListNumberedIcon className="mdi-icon-medium" />, <FormattedMessage id="post.editor.format.bulletedList" />)}
      </div>)}
      {buttons && buttons.length && (<div>
        <div className="margin-2"><span className="tag is-info"><FormattedMessage id="actions" /></span></div>
        {buttons.map(button => (button && <a key={button.key} className={classnames("margin-2 button", button.type)} onClick={button.action}>{button.text}</a>))}
      </div>)}
    </div>);
  }

  hasMark = type => {
    const { value } = this.props;
    return value.marks.some(mark => mark.type == type)
  }

  hasBlock = type => {
    const { value } = this.props;
    return value.blocks.some(node => node.type == type)
  }

  hasInline = type => {
    const { value } = this.props;
    return value.inlines.some(node => node.type == type);
  }

  onClickMark = (event, type) => {
    event.preventDefault()
    const { value } = this.props;
    const change = value.change().toggleMark(type)
    this.props.onChange(change)
  }

  onClickInline = (event, type, callback) => {
    event.preventDefault();
    const { value } = this.props;
    const makeChange = callback && callback("change", value);
    const change = makeChange ? makeChange : this.hasInline(type)
      ? value.change().unwrapInline((callback && callback("unwrap", value)) || type)
      : value.change().wrapInline((callback && callback("wrap", value)) || type);
    this.props.onChange(change);
  }

  onClickBlock = (event, type) => {
    event.preventDefault()
    const { value } = this.props;
    const change = value.change()
    const { document } = value;

    // Handle everything but list buttons.
    if (type != 'bulleted-list' && type != 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        change
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else {
        change.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item')
      const isType = value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type == type)
      })

      if (isList && isType) {
        change
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        change
          .unwrapBlock(
            type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type)
      } else {
        change.setBlocks('list-item').wrapBlock(type)
      }
    }

    this.props.onChange(change)
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
    let isActive = this.hasBlock(type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value } = this.props;
      const parent = value.document.getParent(value.blocks.first().key)
      isActive = this.hasBlock('list-item') && parent && parent.type === type
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