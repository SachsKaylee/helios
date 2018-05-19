import Post from "./Post";

export default ({ posts }) => (
  <section className="articles">
    {posts.map(p => (<Post key={p.id} {...p} />))}
    <style jsx>
    {`.articles {
      margin: 5rem 0;
    }`}
    </style>
  </section>
);