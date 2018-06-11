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
import user from "@fortawesome/fontawesome-free-solid/faUser";
import signIn from "@fortawesome/fontawesome-free-solid/faSignInAlt";
import signOut from "@fortawesome/fontawesome-free-solid/faSignOutAlt";
import trash from "@fortawesome/fontawesome-free-solid/faTrash";
import eye from "@fortawesome/fontawesome-free-solid/faEye";
import spinner from "@fortawesome/fontawesome-free-solid/faSpinner";
import cake from "@fortawesome/fontawesome-free-solid/faBirthdayCake";

// Export the icons here.
export const icons = {
  bold, italic, underline, code, heading, quoteRight, listOl, listUl, upload, exclamation, info, save,
  user, signIn, signOut, trash, eye, spinner, cake
}

const forceArray = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

const spinnerClass = spin => {
  switch (spin) {
    case true: return "fa-spin";
    case "spin": return "fa-spin";
    case "pulse": return "fa-pulse";
    default: return undefined;
  }
}

const sizeClass = size => size && "fa-" + size;

const iconClass = iconName => "fa-" + iconName;

const Icon = ({ children: { prefix, iconName }, spin, size, style }) => (<i
  style={style}
  className={classnames(
    prefix,
    iconClass(iconName),
    spinnerClass(spin),
    sizeClass(size)
  )} />);
export default Icon;

export const IconLayers = ({ children, counter }) => (<span className="fa-layers fa-fw">
  {forceArray(children).map(c => (<Icon key={c.iconName}>{c}</Icon>))}
  {counter && (<span className="fa-layers-counter">{counter}</span>)}
</span>);

fa.config.autoReplaceSvg = true;
Object.keys(icons).forEach(key => fa.library.add(icons[key]));