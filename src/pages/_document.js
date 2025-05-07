import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    {/* Google tag (gtag.js) */}
                    <script async src="https://www.googletagmanager.com/gtag/js?id=G-HLRG18Y9Z2"></script>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', 'G-HLRG18Y9Z2');
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
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                </Head>
                <body style={{ fontFamily: 'Questrial, sans-serif' }}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
