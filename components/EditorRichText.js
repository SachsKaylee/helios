import * as React from "react";
import { withDynamic } from "./system/Dynamic";

export default withDynamic({ 
  jodit: () => import("jodit"), 
  style: () => import("jodit/build/jodit.min.css") 
}, class EditorRichText extends React.Component {
  constructor(p) {
    super(p);
    this.onChange = this.onChange.bind(this);
    this.dom = React.createRef();
    this.jodit = null;
  }

  shouldComponentUpdate(p) {
    if(p.value !== this.props.value) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    // FIXME: I'd rather have this working natively, but this is OK for now
    if (!document.getElementById("jodit-style")) {
      const style = document.createElement("style");
      style.id = "jodit-style";
      style.innerHTML = this.props.style;
      document.head.appendChild(style);
    }

    this.jodit = new this.props.jodit.Jodit(this.dom.current, {
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
      filebrowser: {
        ajax: {
          url: "/api/files/browser"
        }
      },
      uploader: {
        url: "/api/files/upload"
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

  /*UNSAFE_componentWillReceiveProps({ value }) {
    if (this.acceptNewValue && this.jodit && value !== this.jodit.value) {
      console.log(this.jodit)
      this.jodit.value = value;
    }
  }*/

  componentDidUpdate(prevProps) {
    if (this.props.value !== this.jodit.value) {
      this.jodit.value = this.props.value;
    }
  }

  onChange(value) {
    this.props.onChange(value);
  }

  render() {
    return (<textarea ref={this.dom} ></textarea>);
  }
});
