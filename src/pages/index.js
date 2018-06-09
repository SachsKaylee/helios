import Layout from "../components/Layout";
import SidebarLayout from "../components/SidebarLayout";
import Posts from "../components/Posts";
import Card from "../components/Card";
import React from "react";
import axios from "axios";
import { locale } from "../config/client";

export default class extends React.Component {
  static async getInitialProps() {
    // todo: get total amount of posts
    // todo: limit based on page
    const { data } = await axios.get("/api/post");
    return {
      // We do not create the Value here, but instead in render since it was throwing an error with SSR
      posts: data.map(({ _id, author, date, title, content }) => ({
        id: _id,
        title: title,
        content: content,
        date,
        author
      })).sort((a, b) => {
        const keyA = new Date(a.date);
        const keyB = new Date(b.date);
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      })
    };
  }

  render() {
    // todo: pagination
    const { posts } = this.props;
    return (<Layout title={locale.pages.blog.title}>
      <SidebarLayout size={3} sidebar={<Card>{"Lorem Ipsum"}</Card>}>
        <Posts posts={posts.map(p => ({
          ...p,
          title: p.title,
          content: p.content,
          date: new Date(p.date)
        }))} />
      </SidebarLayout>
    </Layout>);
  }
};