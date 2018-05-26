import Post from "./ReadOnlyPost";
import Card from "./Card";

export default ({ posts }) => (
  <section className="articles">
    {posts && posts.length !== 0
      ? posts.map(p => (<Post key={p.id} {...p}/>))
      : <Card compactY><p className="subtitle">No posts could be found 😢</p><p>Maybe try again later?</p></Card>}
  </section>
);