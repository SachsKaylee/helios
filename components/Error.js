import { FormattedMessage } from "react-intl";
import Card from "./layout/Card";

export const FullError = ({ error }) => {
  return (<Card title={<p><FormattedMessage id="error" /></p>}>
    <SlimError error={error} />
  </Card>);
}

export const SlimError = ({ error }) => {
  error = error && error.response ? error.response.data : error;
  const str = byString(error);
  if (str) return str;
  return (<div>todo: handle this error!<code>{JSON.stringify(error)}</code></div>);
}

const byString = string => {
  if ("string" === typeof string) {
    if (string.startsWith("missing-permission-")) {
      const permission = string.substring("missing-permission-".length);
      return (<FormattedMessage id="errorMessages.missingPermission" values={{
        permission: (<span className="tag">{permission}</span>)
      }} />);
    }
    if (string === "no-data") return (<FormattedMessage id="errorMessages.noData" />);
    if (string === "authorization-failure") return (<FormattedMessage id="errorMessages.authorizationFailure" />);
    if (string === "not-logged-in") return (<FormattedMessage id="errorMessages.notLoggedIn" />);
    if (string === "already-logged-in") return (<FormattedMessage id="errorMessages.notLoggedIn" />);
    if (string === "already-exists") return (<FormattedMessage id="errorMessages.alreadyExists" />);
  }
}