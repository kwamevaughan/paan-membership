// src/components/WelcomeCard.js
import CountUp from "react-countup";
import Link from "next/link";

export default function WelcomeCard({ totalApplicants, openPositions, pendingReviews, mode }) {
    return (
      <div
        className={`mt-6 p-6 rounded-xl shadow-md hover:shadow-none animate-fade-in transition-shadow duration-500 border-t-4 border-[#84c1d9] mb-6 ${
          mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h3 className="text-xl font-semibold">Welcome back, PAAN!</h3>
          <p
            className={`text-sm font-bold ${
              mode === "dark" ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex justify-evenly gap-4 mt-4">
          <Link href="/hr/applicants">
            <div className="text-center transform transition-transform duration-300 hover:translate-y-[-5px]">
              <CountUp
                end={totalApplicants}
                duration={2}
                className="text-3xl font-bold text-black"
              />
              <p className="text-base">Total Applicants</p>
            </div>
          </Link>
          <Link href="/hr/applicants">
            <div className="text-center transform transition-transform duration-300 hover:translate-y-[-5px]">
              <CountUp
                end={openPositions}
                duration={2}
                className="text-3xl font-bold text-black"
              />
              <p className="text-base">Open Application</p>
            </div>
          </Link>
          <Link href="/hr/applicants">
            <div className="text-center transform transition-transform duration-300 hover:translate-y-[-5px]">
              <CountUp
                end={pendingReviews}
                duration={2}
                className="text-3xl font-bold text-black"
              />
              <p className="text-base">Pending Reviews</p>
            </div>
          </Link>
        </div>
      </div>
    );
}