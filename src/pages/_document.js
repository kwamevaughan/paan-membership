import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preload Google Fonts for Questrial */}
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Questrial&display=swap"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />

          {/* Google tag (gtag.js) */}
          <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-8V8NXWB1YQ"
            async
          />
          <Script
            strategy="afterInteractive"
            id="google-analytics-script"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-8V8NXWB1YQ');
              `,
            }}
          />

          {/* Add Google Fonts for Questrial */}
          <link
            href="https://fonts.googleapis.com/css2?family=Questrial&display=swap"
            rel="stylesheet"
          />

          {/* Favicon Links */}
          <link rel="icon" href="/favicon.png" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
