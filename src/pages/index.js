import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useState } from "react";
import SEO from "@/components/SEO";

export default function Agencies({ initialOpenings }) {
  const router = useRouter();
  const [selectedOpening, setSelectedOpening] = useState("");
  const [openings] = useState(initialOpenings);

  const handleOpeningChange = (e) => {
    const selectedTitle = e.target.value;
    const opening = openings.find((o) => o.title === selectedTitle);
    setSelectedOpening(opening || "");
  };

  const handleProceed = () => {
    if (selectedOpening) {
      router.push(
        `/interview?opening=${encodeURIComponent(
          selectedOpening.title
        )}&job_type=${encodeURIComponent(
          selectedOpening.job_type
        )}&opening_id=${encodeURIComponent(selectedOpening.id)}`
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SEO
        title="Join PAAN | Pan-African Agency Network"
        description="Join PAAN, Africa's leading network of creative and tech agencies. Collaborate, innovate, and grow with top agencies across the continent and diaspora."
        keywords="PAAN, expression of interest, African agencies, creative agencies, tech agencies, marketing agencies, PR agencies, collaboration, innovation, business growth"
      />

      {/* Enhanced Background with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <iframe
          className="w-full h-full object-cover scale-105"
          src="https://www.youtube.com/embed/InDtkDgVb1Q?autoplay=1&loop=1&playlist=InDtkDgVb1Q&controls=0&mute=1&showinfo=0&rel=0&modestbranding=1&fs=0"
          frameBorder="0"
          allow="autoplay; fullscreen"
          title="Background Video"
          loading="lazy"
        />
        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        {/* Animated gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
      </div>

      {/* Floating Navigation Elements */}
      <div className="absolute top-6 right-6 z-20">
        <Link href="/freelancers">
          <div className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <span className="text-sm font-medium">For Freelancers</span>
            <Icon
              icon="tabler:arrow-up-right"
              className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300"
            />
          </div>
        </Link>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="w-full max-w-4xl">
          {/* Hero Section with Glassmorphism */}
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Logo with Animation */}
            <div className="text-center mb-8">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://paan.africa"
                className="inline-block group"
              >
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-2xl">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="PAAN Logo"
                    width={180}
                    height={180}
                    className="mx-auto transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl"
                  />
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-blue-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              </a>
            </div>

            {/* Enhanced Typography */}
            <div className="text-center ">
              <h1 className="text-4xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Welcome to the{" "}
                <span className="bg-gradient-to-r from-blue-200 to-sky-600 bg-clip-text text-transparent">
                  Pan-African
                </span>{" "}
                <br className="hidden sm:block" />
                Agency Network
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                An alliance of agencies shaping the future of Africa's
                communication, marketing, PR, tech, research, digital, and
                creative industries.
              </p>

              {/* Animated Divider */}
              <div className="relative mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </div>

              <p className="text-lg text-gray-300 mb-8">
                Fill out the expression of interest (EOI) below to activate
                membership.
              </p>
            </div>

            {/* Modern Form Section */}
            <div className="max-w-2xl mx-auto mb-12">
              <label
                htmlFor="opening"
                className="block text-lg font-semibold text-white mb-4 text-center"
                aria-label="Select an Expression of Interest"
              >
                Current EOIs <span className="text-orange-400">*</span>
              </label>

              {/* Custom Select with Modern Styling */}
              <div className="relative mb-6">
                <select
                  id="opening"
                  value={selectedOpening ? selectedOpening.title : ""}
                  onChange={handleOpeningChange}
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer hover:bg-white/20"
                >
                  <option
                    value=""
                    disabled
                    className="bg-slate-800 text-gray-300"
                  >
                    Select an EOI below
                  </option>
                  {openings.map((opening) => (
                    <option
                      key={opening.id}
                      value={opening.title}
                      className="bg-slate-800 text-white"
                    >
                      {opening.title}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="tabler:chevron-down"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white pointer-events-none transition-transform duration-300"
                />
              </div>

              {/* Enhanced CTA Button */}
              {selectedOpening && (
                <div className="text-center">
                  <button
                    onClick={handleProceed}
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-400 to-sky-900 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    {/* Button background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <span className="relative z-10">
                      Proceed to Application
                    </span>
                    <Icon
                      icon="tabler:arrow-up-right"
                      className="relative z-10 ml-2 w-5 h-5 group-hover:rotate-45 transition-transform duration-300"
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Brand Values with Modern Cards */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                {
                  text: "Collaborate",
                  color: "from-yellow-400 to-yellow-500",
                },
                {
                  text: "Innovate",
                  color: "from-blue-400 to-blue-500",
                },
                {
                  text: "Dominate",
                  color: "from-red-400 to-red-500",
                },
              ].map((item, index) => (
                <div
                  key={item.text}
                  className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  <span className="text-md font-semibold text-white">
                    {item.text}
                  </span>
                  <div
                    className={`w-4 h-4 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Social Media Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
          {[
            {
              href: "https://x.com/paan_network",
              icon: "fa6-brands:square-x-twitter",
              color: "hover:text-blue-400",
              label: "Follow us on X",
            },
            {
              href: "https://www.youtube.com/@PAAN-AFRICA",
              icon: "mdi:youtube",
              color: "hover:text-red-500",
              label: "Subscribe on YouTube",
            },
            {
              href: "https://www.linkedin.com/company/pan-african-agency-network/",
              icon: "mdi:linkedin",
              color: "hover:text-blue-600",
              label: "Connect on LinkedIn",
            },
            {
              href: "https://www.facebook.com/panafricanagencynetwork",
              icon: "mdi:facebook",
              color: "hover:text-blue-500",
              label: "Follow on Facebook",
            },
          ].map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative p-2 text-white ${social.color} transition-all duration-300 hover:scale-110 hover:-translate-y-1 rounded-lg hover:bg-white/10`}
              aria-label={social.label}
            >
              <Icon icon={social.icon} className="w-6 h-6" />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                {social.label}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-orange-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </div>
  );
}

export async function getStaticProps() {
  const { getAgenciesPageStaticProps } = await import(
    "@/../utils/getPropsUtils"
  );
  return await getAgenciesPageStaticProps();
}
