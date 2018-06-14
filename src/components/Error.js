import { FormattedMessage } from "react-intl";
import Card from "./Card";

export const FullError = ({ error }) => {
  return (<Card title={<p><FormattedMessage id="error" /></p>}>
    <SlimError error={error} />
  </Card>);
}

export const SlimError = ({ error }) => {
  const str = byString(error);
  if (str) return str;
  return (<div>todo: handle this error!<code>{JSON.str(error)}</code></div>);
}

const byString = string => {
  if (string.startsWith("missing-permission-")) {
    const permission = string.substring("missing-permission-".length);
    return (<FormattedMessage id="errorMessages.missingPermission" values={{
      permission: (<span className="tag">{permission}</span>)
    }} />);
  }
  if (string === "no-data") return (<FormattedMessage id="errorMessages.noData" />);
  if (string === "incorrect-password") return (<FormattedMessage id="errorMessages.incorrectPassword" />);
  if (string === "not-logged-in") return (<FormattedMessage id="errorMessages.notLoggedIn" />);
  if (string === "already-logged-in") return (<FormattedMessage id="errorMessages.notLoggedIn" />);

}