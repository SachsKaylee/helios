import * as React from "react";
import 'jodit/build/jodit.min.css';
import Dynamic from "../components/Dynamic";

export default class EditorRichText extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (<Dynamic {...this.props} dynamic={{
      loader: () => import("jodit").then(() => import("jodit-react"))
    }}/> );
  }
}
