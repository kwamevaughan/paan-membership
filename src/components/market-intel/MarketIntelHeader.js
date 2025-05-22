import { motion } from "framer-motion";

export default function MarketIntelHeader({
  mode,
  pageName,
  pageDescription,
  breadcrumbs,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-12"
    >
      <h1
        className={`text-5xl font-semibold ${
          mode === "dark" ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {pageName}
      </h1>
      <p
        className={`mt-4 text-lg ${
          mode === "dark" ? "text-gray-400" : "text-gray-500"
        } max-w-3xl mx-auto`}
      >
        {pageDescription}
      </p>
      
    </motion.div>
  );
}
