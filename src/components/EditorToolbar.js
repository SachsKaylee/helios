import { Editor } from 'slate-react'
import { Value } from 'slate'
import classNames from "classnames";
import React from 'react'
import { isKeyHotkey } from 'is-hotkey'
import ReactTooltip from 'react-tooltip';
import Tag from "./Tag";
import { IconLayers, icons } from "./Icon";

const DEFAULT_NODE = 'paragraph'
const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')

export default class extends React.Component {
  hasMark = type => {
    const { value } = this.props;
    return value.activeMarks.some(mark => mark.type == type)
  }

  hasBlock = type => {
    const { value } = this.props;
    return value.blocks.some(node => node.type == type)
  }

  onKeyDown = (event, change) => {
    let mark

    if (isBoldHotkey(event)) {
      mark = 'bold'
    } else if (isItalicHotkey(event)) {
      mark = 'italic'
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underlined'
    } else if (isCodeHotkey(event)) {
      mark = 'code'
    } else {
      return
    }

    event.preventDefault()
    change.toggleMark(mark)
    return true
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
        <div className="margin-2"><Tag type="info">Format Selection</Tag></div>
        {this.renderMarkButton('bold', icons.bold, "Bold")}
        {this.renderMarkButton('italic', icons.italic, "Italic")}
        {this.renderMarkButton('underlined', icons.underline, "Underlined")}
        {this.renderMarkButton('code', icons.code, "Inline Code")}
      </div>)}
      {stylesChooser && (<div>
        <div className="margin-2"><Tag type="info">Format Paragraph</Tag></div>
        {this.renderBlockButton('heading-one', icons.heading, "Headline 1", "H1")}
        {this.renderBlockButton('heading-two', icons.heading, "Headline 2", "H2")}
        {this.renderBlockButton('block-quote', icons.quoteRight, "Quote")}
        {this.renderBlockButton('numbered-list', icons.listOl, "Numbered List")}
        {this.renderBlockButton('bulleted-list', icons.listUl, "Bulleted List")}
      </div>)}
      {buttons && (<div>
        <div className="margin-2"><Tag type="info">Post Actions</Tag></div>
        {buttons.publish && (<a className="margin-2 button is-primary" onClick={this.props.onSave}>Publish</a>)}
        {buttons.discard && (<a className="margin-2 button is-danger" onClick={this.props.onCancel}>Discard</a>)}
        {buttons.delete && (<a className="margin-2 button is-danger" onClick={this.props.onDelete}>Delete</a>)}
      </div>)}
    </div>)
  }

  renderMarkButton = (type, icon, tooltip, details) => {
    const isActive = this.hasMark(type)
    const onMouseDown = event => this.onClickMark(event, type)

    return (
      <span className="icon" onMouseDown={onMouseDown} data-active={isActive} data-tip={tooltip} data-for="editor-toolbar"
        style={isActive ? { border: "1px solid", borderRadius: 1, margin: 1 } : { margin: 1 }}>
        <IconLayers counter={details}>{icon}</IconLayers>
      </span>
    )
  }

  renderBlockButton = (type, icon, tooltip, details) => {
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
        <IconLayers counter={details}>{icon}</IconLayers>
      </span>
    )
  }
}