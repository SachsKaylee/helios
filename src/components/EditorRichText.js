import * as React from "react";
import JoditStyle from 'jodit/build/jodit.min.css';
import Dynamic from "./system/Dynamic";

export default class EditorRichText extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    // FIXME: I'd rather have this working natively, but this is OK for now
    if (!document.getElementById("jodit-style")) {
      const style = document.createElement("style");
      style.id ="jodit-style";
      style.innerHTML = JoditStyle;
      document.head.appendChild(style);
    }
  }

  render() {
    return (<Dynamic {...this.props} dynamic={{
      loader: () => import("jodit").then(() => import("jodit-react"))
    }}/> );
  }
}
