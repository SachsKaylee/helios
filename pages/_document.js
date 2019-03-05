import Document, { Head, Main, NextScript } from "next/document";
import style from "../styles/style.sass";
import userStyle from "../config/style.sass";

export default class _Document extends Document {
  static async getInitialProps(ctx) {
    const config = ctx.req && ctx.req.system && await ctx.req.system.config();
    const locale = ctx.req && ctx.req.system && await ctx.req.system.locale();
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, config, locale };
  }

  render() {
    const { config, locale } = this.props;
    return (
      <html lang={config ? config.locale : "en"}>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
          <meta name="robots" content="index, follow" />
          <meta name="generator" content="Helios" />
          <meta key="theme-color" name="theme-color" content="aliceblue" />
          <meta key="description" name="description" content={config ? config.description : "Helios Setup"} />
          {config && <meta key="keywords" name="keywords" content={config.topics.join(", ")} />}
          <link key="manifest" rel="manifest" href="/manifest.json" />
          <link rel="icon" type="image/x-icon" href="/static/content/system/favicon.ico" sizes="any" />
          <style key="style" dangerouslySetInnerHTML={{ __html: style }} />
          <style key="userStyle" dangerouslySetInnerHTML={{ __html: userStyle }} />
          <script id="intl" key="intl" src="/api/system/locale/intl" />
          <script id="config" key="config" dangerouslySetInnerHTML={{ __html: `window.__HELIOS_CONFIG__ = ${JSON.stringify(config)};` }} />
          <script id="locale" key="locale" dangerouslySetInnerHTML={{ __html: `window.__HELIOS_LOCALE__ = ${JSON.stringify(locale)};` }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}