import Document, { Head, Main, NextScript } from "next/document";
import style from "../../styles/style.sass";
import config from "../config/client";

export default class _Document extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <html>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
          <meta name="robots" content="index, follow" />
          <meta name="generator" content="Helios" />
          <meta key="description" name="description" content={config.description} />
          <meta key="keywords" name="keywords" content={config.topics.join(", ")} />
          <link key="manifest" rel="manifest" href="/manifest.json" />
          <style dangerouslySetInnerHTML={{ __html: style }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}