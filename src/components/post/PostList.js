import Post from "./Post";
import Card from "../layout/Card";
import { FormattedMessage } from "react-intl";
import EmoticonSadIcon from "mdi-react/EmoticonSadIcon";

export default ({ posts }) => (
  <section className="articles">
    {posts && posts.length !== 0
      ? posts.map(p => (<Post key={p._id} {...p} />))
      : <Card><p className="subtitle"><EmoticonSadIcon className="mdi-icon-spacer" /> <FormattedMessage id="post.noneFound" /></p></Card>}
  </section>
);