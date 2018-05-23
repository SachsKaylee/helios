import { Editor } from 'slate-react'
import { Value } from 'slate'
import classNames from "classnames";
import React from 'react'
import { isKeyHotkey } from 'is-hotkey'
import ReactTooltip from 'react-tooltip';
import Tag from "./Tag";

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
      {stylesChooser && (<div className="style-chooser">
        <p className="style-chooser-text"><Tag type="info">Format Selection</Tag></p>
        {this.renderMarkButton('bold', 'bold', "Bold")}
        {this.renderMarkButton('italic', 'italic', "Italic")}
        {this.renderMarkButton('underlined', 'underline', "Underlined")}
        {this.renderMarkButton('code', 'code', "Inline Code")}
      </div>)}
      {stylesChooser && (<div className="style-chooser">
        <p className="style-chooser-text"><Tag type="info">Format Paragraph</Tag></p>
        {this.renderBlockButton('heading-one', 'heading', "Headline 1", "H1")}
        {this.renderBlockButton('heading-two', 'heading', "Headline 2", "H2")}
        {this.renderBlockButton('block-quote', 'quote-right', "Quote")}
        {this.renderBlockButton('numbered-list', 'list-ol', "Numbered List")}
        {this.renderBlockButton('bulleted-list', 'list-ul', "Bulleted List")}
      </div>)}
      <div className="style-chooser">
        <p className="style-chooser-text"><Tag type="info">Post Actions</Tag></p>
        {buttons.publish && (<a className="style-chooser-button button is-primary" onClick={this.props.onSave}>Publish</a>)}
        {buttons.discard && (<a className="style-chooser-button button is-danger" onClick={this.props.onCancel}>Discard</a>)}
        {buttons.delete && (<a className="style-chooser-button button is-danger" onClick={this.props.onDelete}>Delete</a>)}
      </div>
      <style jsx>{`
        .style-chooser {
          padding-bottom: 12px;
        }
        .style-chooser-text {
          margin-bottom: 2px !important;
        }
        .style-chooser-button {
          margin-right: 2px;
          margin-bottom: 2px;
        }
      `}</style>
    </div>)
  }

  renderMarkButton = (type, icon, tooltip, details) => {
    const isActive = this.hasMark(type)
    const onMouseDown = event => this.onClickMark(event, type)

    return (
      <span className="icon" onMouseDown={onMouseDown} data-active={isActive} data-tip={tooltip} data-for="editor-toolbar"
        style={isActive ? { border: "1px solid", borderRadius: 1, margin: 1 } : { margin: 1 }}>
        <span className="fa-layers fa-fw">
          <i className={classNames("fas", "fa-" + icon)} />
          {details && <span className="fa-layers-counter">{details}</span>}
        </span>
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
        <span className="fa-layers fa-fw">
          <i className={classNames("fas", "fa-" + icon)} />
          {details && <span className="fa-layers-counter">{details}</span>}
        </span>
      </span>
    )
  }
}