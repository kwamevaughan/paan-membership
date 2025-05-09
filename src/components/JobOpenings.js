import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function JobOpenings({ candidates, jobOpenings, router, mode }) {
    useEffect(() => {
        import("swiper").then(() => {});
    }, []);

    return (
      <div
        className={`border-t-4 border-[#84c1d9] p-6 rounded-xl shadow-lg hover:shadow-xl animate-fade-in transition-shadow duration-500 max-w-full overflow-hidden ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-6 ${
            mode === "dark" ? "text-white" : "text-[#231812]"
          }`}
        >
          Expression of Interest (EOIs)
        </h3>
        <div className="relative max-w-full overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={8}
            slidesPerView={1}
            loop={true} // Enable looping
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
              bulletClass: "swiper-pagination-bullet", // Use the CSS class for bullets
              bulletActiveClass: "swiper-pagination-bullet-active", // Use the CSS class for active bullets
            }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 8 }, // Mobile
              768: { slidesPerView: 2, spaceBetween: 12 }, // Desktop
              1024: { slidesPerView: 3, spaceBetween: 16 }, // Large
            }}
            className="w-full"
            style={{ overflow: "hidden" }}
          >
            {jobOpenings.map((opening) => {
              const count = candidates.filter(
                (c) => c.opening === opening
              ).length;
              return (
                <SwiperSlide key={opening} className="flex justify-center">
                  <div
                    className={`relative p-4 rounded-lg border cursor-pointer transform transition-all duration-300 w-full max-w-[280px] shadow-md hover:shadow-lg hover:translate-y-[-8px] ${
                      mode === "dark"
                        ? "border-[#84c1d9] text-white"
                        : "border-[#84c1d9] text-[#231812]"
                    }`}
                    style={{
                      borderWidth: "1px",
                    }}
                    onClick={() =>
                      router.push(`/hr/applicants?opening=${opening}`)
                    }
                  >
                    <p
                      className={`font-semibold text-base truncate mb-2 ${
                        mode === "dark" ? "text-white" : "text-[#231812]"
                      }`}
                    >
                      {opening}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${
                          mode === "dark"
                            ? "bg-[#84c1d9] text-white"
                            : "bg-[#84c1d9] text-white"
                        }`}
                      >
                        {count} Applicants
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-lg pointer-events-none" />
                  </div>
                </SwiperSlide>
              );
            })}
            <div
              className={`swiper-button-prev p-2 rounded-full bg-[#231812] text-white hover:bg-[#f05d23] transition-colors`}
            ></div>
            <div
              className={`swiper-button-next p-2 rounded-full bg-[#231812] text-white hover:bg-[#f05d23] transition-colors`}
            ></div>
            <div className="swiper-pagination mt-4"></div>
          </Swiper>
        </div>
      </div>
    );
}
