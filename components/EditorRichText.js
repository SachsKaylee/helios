import * as React from "react";
import JoditStyle from 'jodit/build/jodit.min.css';
import Dynamic from "./system/Dynamic";

export default class EditorRichText extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      value: p.value || ""
    };
    this.onChange = this.onChange.bind(this);
    this.jodit = React.createRef();
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    // FIXME: I'd rather have this working natively, but this is OK for now
    if (!document.getElementById("jodit-style")) {
      const style = document.createElement("style");
      style.id = "jodit-style";
      style.innerHTML = JoditStyle;
      document.head.appendChild(style);
    }
  }

  UNSAFE_componentWillReceiveProps({ value }) {
    if (this.jodit.current && value !== this.state.value) {
      this.setState({ value });
      this.jodit.current.editor.value = value;
    }
  }

  onChange(value) {
    console.log("changed", value)
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  render() {
    return (<Dynamic dynamic={{
      loader: () => import("jodit").then(() => import("jodit-react")),
      render: Jodit => (<Jodit
        ref={this.jodit}
        {...this.props}
        onChange={this.onChange}
        config={{
          sourceEditorCDNUrlsJS: [
            '/node_modules/ace-builds/src-min/ace.js'
          ],
          beautifyHTMLCDNUrlsJS: [
            '/node_modules/js-beautify/js/lib/beautify.js',
            '/node_modules/js-beautify/js/lib/beautify-html.js'
          ],
          sourceEditorNativeOptions: {
            theme: "ace/theme/chrome"
          },
          ...(this.props.config || {})
        }} />)
    }} />);
  }
}
