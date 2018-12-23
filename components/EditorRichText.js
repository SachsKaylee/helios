import * as React from "react";
import JoditStyle from 'jodit/build/jodit.min.css';
import { withDynamic } from "./system/Dynamic";

export default withDynamic({ Jodit: () => import("jodit") }, class EditorRichText extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      value: p.value || ""
    };
    this.onChange = this.onChange.bind(this);
    this.dom = React.createRef();
    this.jodit = null;
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

    this.jodit = new this.props.Jodit(this.dom.current, {
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
    });
    this.jodit.value = this.props.value;
    this.jodit.events.on("change", this.onChange);
  }

  componentWillUnmount() {
    if (this.jodit) {
      this.jodit.destruct();
      this.jodit = null;
    }
  }

  UNSAFE_componentWillReceiveProps({ value }) {
    if (value !== this.state.value) {
      this.setState({ value });
      this.jodit.value = value;
    }
  }

  onChange(value) {
    if (this.state.value !== value) {
      this.setState({ value }, () => {
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      });
    }
  }

  render() {
    return (<textarea ref={this.dom} ></textarea>);
  }
});
