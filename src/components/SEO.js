import Head from "next/head";
import { useRouter } from "next/router";

const SEO = ({
  title = "Pan-African Agency Network (PAAN)",
  description = "Join PAAN, Africa’s leading network of creative and tech agencies and freelancers. Collaborate, innovate, and grow with top talent across the continent.",
  keywords = "PAAN, Pan-African Agency Network, African agencies, creative agencies, tech agencies, freelancers, collaboration, innovation, business growth",
  image = "https://membership.paan.africa/assets/images/logo.svg",
  noindex = false,
  imageWidth = 1200,
  imageHeight = 630,
}) => {
  const router = useRouter();
  // Construct the full URL for the current page
  const canonicalUrl = `https://membership.paan.africa${
    router.asPath === "/" ? "" : router.asPath.split("?")[0]
  }`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Pan-African Agency Network (PAAN)" />
      <meta name="robots" content={noindex ? "noindex" : "index, follow"} />
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      {/* Favicon and Icons */}
      <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon" />
      <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" />
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={imageWidth.toString()} />
      <meta property="og:image:height" content={imageHeight.toString()} />
      <meta
        property="og:image:alt"
        content="PAAN - Redefining Africa’s Creative & Tech Footprint"
      />
      <meta
        property="og:site_name"
        content="Pan-African Agency Network (PAAN)"
      />
      <meta property="og:locale" content="en_US" />
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="PAAN - Redefining Africa’s Creative & Tech Footprint"
      />
      <meta name="twitter:site" content="@paan_network" />
      <meta name="twitter:creator" content="@paan_network" />
    </Head>
  );
};

export default SEO;
