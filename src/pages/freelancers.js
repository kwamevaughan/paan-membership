import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import SEO from "@/components/SEO";

export default function Freelancers({ initialOpenings }) {
  const [selectedOpening, setSelectedOpening] = useState("");
  const [openings] = useState(initialOpenings);

  const handleOpeningChange = (e) => {
    const selectedTitle = e.target.value;
    const opening = openings.find((o) => o.title === selectedTitle);
    setSelectedOpening(opening || "");
  };

  const handleProceed = () => {
    if (selectedOpening) {
      const url = `/interview?opening=${encodeURIComponent(
        selectedOpening.title
      )}&job_type=${encodeURIComponent(
        selectedOpening.job_type
      )}&opening_id=${encodeURIComponent(selectedOpening.id)}`; // Add opening_id
      window.location.href = url;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6">
      <SEO
        title="Expression of Interest for Freelancers to Join PAAN | Pan-African Agency Network"
        description="Join PAAN’s Certified Freelancers Program to access top creative and tech projects across Africa. Apply now to collaborate with leading agencies and clients."
        keywords="PAAN, freelancers, expression of interest, Africa, creative freelancers, tech freelancers, collaboration, African talent, agency projects, certified freelancers"
      />

      <div className="absolute top-0 left-0 w-full h-full z-0">
        <iframe
          className="w-full h-full object-cover"
          src="https://www.youtube.com/embed/InDtkDgVb1Q?autoplay=1&loop=1&playlist=InDtkDgVb1Q&controls=0&mute=1&showinfo=0&rel=0&modestbranding=1&fs=0"
          frameBorder="0"
          allow="autoplay; fullscreen"
          title="Background Video"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black to-transparent opacity-90 z-1"></div>
      </div>

      <div className="relative max-w-full sm:max-w-3xl mx-auto p-6 sm:p-10 text-center bg-white bg-opacity-90 backdrop-blur-lg shadow-full rounded-lg z-10">
        <div className="mb-6">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://paan.africa"
          >
            <Image
              src="/assets/images/logo.svg"
              alt="PAAN Logo"
              width={200}
              height={200}
              className="mx-auto transform transition duration-300 hover:scale-110"
            />
          </a>
        </div>
        <h1 className="text-3xl font-bold text-[#231812] mb-4">
          PAAN Certified Freelancers Program
        </h1>
        <p className="text-[#231812] mb-4 text-base">
          PAAN Certified Freelancers are a vetted network of specialized
          professionals across Africa who collaborate with agencies and clients
          to provide high-quality, on-demand talent in creative, technical, and
          strategic fields. This program ensures agencies & clients have access
          to trusted freelancers to fill skill gaps and scale projects
          efficiently.
        </p>
        <hr className="h-px my-8 bg-[#F05D23] border-0 dark:bg-gray-700" />
        <p className="text-[#231812] mb-8 text-base">
          Please fill out the below expression of interest (EOI) to activate
          membership.
        </p>
        <div className="mb-6">
          <label
            htmlFor="opening"
            className="block text-lg font-medium text-[#231812] mb-2"
          >
            Current EOIs <span className="text-red-500">*</span>
          </label>
          <select
            id="opening"
            value={selectedOpening ? selectedOpening.title : ""}
            onChange={handleOpeningChange}
            className="w-full sm:w-3/4 mx-auto p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f05d23] focus:border-[#f05d23] transition-all duration-200 bg-white text-[#231812]"
          >
            <option value="" disabled>
              Select an EOI below
            </option>
            {openings.map((opening) => (
              <option key={opening.id} value={opening.title}>
                {" "}
                {/* Use id as key */}
                {opening.title}
              </option>
            ))}
          </select>
          {selectedOpening && (
            <button
              onClick={handleProceed}
              className="bg-[#172840] hover:bg-[#6FA1B7] text-white mt-4 flex items-center mx-auto px-8 py-3 rounded-full font-medium text-sm transition duration-300"
            >
              Proceed
              <Icon
                icon="tabler:arrow-up-right"
                width={20}
                height={20}
                className="ml-2"
              />
            </button>
          )}
        </div>

        <Link href="/" className="">
          <span className="flex items-center gap-2 font-bold p-4 z-10 transform transition-transform hover:translate-y-[-2px] sm:absolute sm:bottom-0 sm:right-0 sm:flex sm:mt-4 w-full sm:w-auto justify-center">
            For Agencies
            <Image
              src="/assets/images/single-arrow.png"
              alt="Arrow"
              width={20}
              height={20}
              className=""
            />
          </span>
        </Link>

        <div className="flex justify-center gap-4 text-center md:text-left py-10">
          <p className="text-2xl font-medium">Collaborate</p>
          <span className="flex bg-[#F2B706] rounded-full w-8 h-8"></span>
          <p className="text-2xl font-medium">Innovate</p>
          <span className="flex bg-[#84C1D9] rounded-full w-8 h-8"></span>
          <p className="text-2xl font-medium">Dominate</p>
          <span className="flex bg-[#F25849] rounded-full w-8 h-8"></span>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-4 sm:space-x-6 p-2 bg-white bg-opacity-50 backdrop-blur-lg shadow-full rounded-lg">
          <a
            href="https://x.com/paan_network"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition duration-300 hover:-translate-y-2 group"
          >
            <Icon
              icon="fa6-brands:square-x-twitter"
              width={30}
              height={30}
              className="text-black"
            />
            <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white bg-black p-2 rounded-lg text-center opacity-0 group-hover:opacity-70 transition-opacity duration-300 w-36 max-w-xs">
              Follow us on X
            </span>
          </a>
          <a
            href="https://www.youtube.com/@PAAN-AFRICA"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition duration-300 hover:-translate-y-2 group"
          >
            <Icon
              icon="mdi:youtube"
              width={30}
              height={30}
              className="text-[#FF0000]"
            />
            <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white bg-black p-2 rounded-lg text-center opacity-0 group-hover:opacity-70 transition-opacity duration-300 w-36 max-w-xs">
              Subscribe to us on YouTube
            </span>
          </a>
          <a
            href="https://www.linkedin.com/company/pan-african-agency-network/"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition duration-300 hover:-translate-y-2 group"
          >
            <Icon
              icon="mdi:linkedin"
              width={30}
              height={30}
              className="text-[#0077B5]"
            />
            <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white bg-black p-2 rounded-lg text-center opacity-0 group-hover:opacity-70 transition-opacity duration-300 w-36 max-w-xs">
              Connect with us on LinkedIn
            </span>
          </a>
          <a
            href="https://www.facebook.com/panafricanagencynetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition duration-300 hover:-translate-y-2 group"
          >
            <Icon
              icon="mdi:facebook"
              width={30}
              height={30}
              className="text-[#4267B2]"
            />
            <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white bg-black p-2 rounded-lg text-center opacity-0 group-hover:opacity-70 transition-opacity duration-300 w-36 max-w-xs">
              Follow us on Facebook
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const { data, error } = await supabase
    .from("job_openings")
    .select("id, title, job_type") // Add id
    .eq("job_type", "freelancers")
    .gt("expires_on", new Date().toISOString());

  if (error) {
    console.error("Error fetching openings in getStaticProps:", error);
    return { props: { initialOpenings: [] }, revalidate: 60 };
  }

  return {
    props: {
      initialOpenings: data,
    },
    revalidate: 60,
  };
}
