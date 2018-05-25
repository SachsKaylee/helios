import classnames from "classnames";
import fa from "@fortawesome/fontawesome";

// All Icons. Make sure to export them!
import bold from "@fortawesome/fontawesome-free-solid/faBold";
import italic from "@fortawesome/fontawesome-free-solid/faItalic";
import underline from "@fortawesome/fontawesome-free-solid/faUnderline";
import code from "@fortawesome/fontawesome-free-solid/faCode";
import heading from "@fortawesome/fontawesome-free-solid/faHeading";
import quoteRight from "@fortawesome/fontawesome-free-solid/faQuoteRight";
import listOl from "@fortawesome/fontawesome-free-solid/faListOl";
import listUl from "@fortawesome/fontawesome-free-solid/faListUl";
import upload from "@fortawesome/fontawesome-free-solid/faUpload";
import exclamation from "@fortawesome/fontawesome-free-solid/faExclamation";
import info from "@fortawesome/fontawesome-free-solid/faInfo";
import save from "@fortawesome/fontawesome-free-solid/faSave";

// Export the icons here.
export const icons = {
  bold, italic, underline, code, heading, quoteRight, listOl, listUl, upload, exclamation, info, save
}

const forceArray = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

const Icon = ({ children: { prefix, iconName } }) => (<i className={classnames(prefix, "fa-" + iconName)} />);
export default Icon;

export const IconLayers = ({ children, counter }) => (<span className="fa-layers fa-fw">
  {forceArray(children).map(c => (<Icon key={c.iconName}>{c}</Icon>))}
  {counter && (<span className="fa-layers-counter">{counter}</span>)}
</span>);

Object.keys(icons).forEach(key => fa.library.add(icons[key]));