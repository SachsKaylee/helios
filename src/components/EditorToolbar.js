import React from 'react'
import ReactTooltip from 'react-tooltip';
import Tag from "./Tag";
import classnames from "classnames";
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlineIcon, CodeBracesIcon, FormatHeader1Icon, FormatHeader2Icon, FormatQuoteOpenIcon, FormatListBulletedIcon, FormatListNumberedIcon } from 'mdi-react';
import { FormattedMessage } from 'react-intl';

const DEFAULT_NODE = "line";

export default class EditorToolbar extends React.Component {
  hasMark = type => {
    const { value } = this.props;
    return value.activeMarks.some(mark => mark.type == type)
  }

  hasBlock = type => {
    const { value } = this.props;
    return value.blocks.some(node => node.type == type)
  }

  onClickMark = (event, type) => {
    event.preventDefault()
    const { value } = this.props;
    const change = value.change().toggleMark(type)
    this.props.onChange(change)
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

  render() {
    const { stylesChooser, buttons } = this.props;
    return (<div>
      <ReactTooltip id="editor-toolbar" effect="solid" />
      {stylesChooser && (<div>
        <div className="margin-2"><Tag type="info"><FormattedMessage id="editor.formatSelection" /></Tag></div>
        {this.renderMarkButton('bold', <FormatBoldIcon className="mdi-icon-medium" />, "Bold")}
        {this.renderMarkButton('italic', <FormatItalicIcon className="mdi-icon-medium" />, "Italic")}
        {this.renderMarkButton('underlined', <FormatUnderlineIcon className="mdi-icon-medium" />, "Underlined")}
        {this.renderMarkButton('code', <CodeBracesIcon className="mdi-icon-medium" />, "Inline Code")}
      </div>)}
      {stylesChooser && (<div>
        <div className="margin-2"><Tag type="info"><FormattedMessage id="editor.formatParagraph" /></Tag></div>
        {this.renderBlockButton('heading-one', <FormatHeader1Icon className="mdi-icon-medium" />, "Headline 1")}
        {this.renderBlockButton('heading-two', <FormatHeader2Icon className="mdi-icon-medium" />, "Headline 2")}
        {this.renderBlockButton('block-quote', <FormatQuoteOpenIcon className="mdi-icon-medium" />, "Quote")}
        {this.renderBlockButton('numbered-list', <FormatListBulletedIcon className="mdi-icon-medium" />, "Numbered List")}
        {this.renderBlockButton('bulleted-list', <FormatListNumberedIcon className="mdi-icon-medium" />, "Bulleted List")}
      </div>)}
      {buttons && buttons.length && (<div>
        <div className="margin-2"><Tag type="info"><FormattedMessage id="actions" /></Tag></div>
        {buttons.map(button => (button && <a key={button.key} className={classnames("margin-2 button", button.type)} onClick={button.action}>{button.text}</a>))}
      </div>)}
    </div>);
  }

  renderMarkButton = (type, icon, tooltip) => {
    const isActive = this.hasMark(type)
    const onMouseDown = event => this.onClickMark(event, type)

    return (
      <span className="icon" onMouseDown={onMouseDown} data-active={isActive} data-tip={tooltip} data-for="editor-toolbar"
        style={isActive ? { border: "1px solid", borderRadius: 1, margin: 1 } : { margin: 1 }}>
        {icon}
      </span>
    )
  }

  renderBlockButton = (type, icon, tooltip) => {
    let isActive = this.hasBlock(type)

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value } = this.props;
      const parent = value.document.getParent(value.blocks.first().key)
      isActive = this.hasBlock('list-item') && parent && parent.type === type
    }
    const onMouseDown = event => this.onClickBlock(event, type)

    return (
      <span className="icon" onMouseDown={onMouseDown} data-active={isActive} data-tip={tooltip} data-for="editor-toolbar"
        style={isActive ? { border: "1px solid", borderRadius: 1, margin: 1 } : { margin: 1 }}>
        {icon}
      </span>
    )
  }
}