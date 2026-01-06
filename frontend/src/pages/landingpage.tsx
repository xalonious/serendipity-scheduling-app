import React from "react";
import Header from "../components/Header";
import { FaDiscord, FaUsers, FaTheaterMasks, FaCalendarAlt } from "react-icons/fa";
import "../styles/animations.css";
import "../styles/index.css";
import logo from "../assets/logo.png";

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary-bg)] text-gray-800">
      <Header />

      <section
        className="
          relative
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-8 py-12
          min-h-screen
          bg-[var(--hero-bg-start)]
          bg-gradient-to-br
          to-[var(--hero-bg-end)]
          animate-gradientShift
        "
      >
        <img
          src={logo}
          alt="Serendipity Logo"
          className="w-56 sm:w-64 md:w-72 lg:w-80 mb-8 rounded-3xl shadow-xl border-4 border-[var(--accent-primary)] bg-white/80 opacity-0 animate-pop"
          style={{ animationDelay: "0.2s" }}
        />

        <h1
          className="
        font-sans
        text-[clamp(2.5rem,6vw,3.8rem)]
        mb-3
        bg-clip-text text-transparent
        bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
        drop-shadow-[0_0_15px_rgba(255,107,107,0.3)]
        opacity-0
        animate-fadeInUp
          "
          style={{ animationDelay: "0.5s" }}
        >
          Welcome to Serendipity

          <span
        className="
          block
          w-16 h-1
          bg-[var(--accent-primary)]
          rounded
          opacity-0
          transform origin-left scale-x-0
          animate-scaleInX
        "
        style={{ animationDelay: "1s" }}
          />
        </h1>

        <p
          className="
        max-w-xl
        text-[clamp(1rem,2.5vw,1.15rem)]
        mx-auto
        text-gray-800
        opacity-0 animate-fadeInUp
          "
          style={{ animationDelay: "0.8s" }}
        >
          Step into a playful therapy roleplay adventure on Roblox—where empathy
          meets creativity. Join our caring community today!
        </p>

        <div
          className="flex flex-wrap gap-5 justify-center mt-6 opacity-0 animate-fadeInUp"
          style={{ animationDelay: "1.1s" }}
        >
          <a
        href="https://www.roblox.com/communities/4346739/Serendipity-Support-Center#!/about"
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex items-center gap-3
          px-8 py-3
          rounded-full
          font-semibold text-base
          text-white
          shadow-[0_5px_15px_rgba(0,0,0,0.15)]
          transition-transform transition-shadow transition-bg duration-300
          bg-gradient-to-br from-[var(--roblox-red)] to-[var(--accent-secondary)]
          hover:from-[#FF5C5C] hover:to-[#FF7F7F]
          hover:shadow-[0_8px_25px_rgba(255,107,107,0.3)]
          transform hover:-translate-y-1.5 hover:scale-105
        "
          >
        <i className="fab fa-roblox text-xl" />
        Visit Roblox Group
          </a>

          <a
        href="https://discord.gg/serendipity"
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex items-center gap-3
          px-8 py-3
          rounded-full
          font-semibold text-base
          text-white
          shadow-[0_5px_15px_rgba(0,0,0,0.15)]
          transition-transform transition-shadow transition-bg duration-300
          bg-gradient-to-br from-[var(--discord-blue)] to-[#8FB2FF]
          hover:from-[#6278C4] hover:to-[#7F9FF2]
          hover:shadow-[0_8px_25px_rgba(114,137,218,0.3)]
          transform hover:-translate-y-1.5 hover:scale-105
        "
          >
        <FaDiscord className="text-xl" />
        Join Discord Server
          </a>
        </div>

        <div
          className="
        absolute bottom-8 left-1/2 transform -translate-x-1/2
        opacity-0
        animate-fadeIn
        animate-bounceArrow
          "
          style={{ animationDelay: "2s" }}
        >
          <svg
        className="w-8 h-8 text-white/70"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
          >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
          </svg>
        </div>
      </section>

      <div className="w-full overflow-hidden leading-[0]">
        <svg
          className="block w-[calc(100%+1.3px)] h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-[var(--primary-bg)]"
          />
        </svg>
      </div>

      <section className="bg-[var(--primary-bg)] px-8 py-16 flex-grow">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div
            className="
              bg-white rounded-2xl border-t-4 border-[var(--accent-secondary)]
              p-8
              shadow-[0_6px_12px_rgba(0,0,0,0.07),0_8px_18px_rgba(0,0,0,0.05)]
              transition-all duration-350 ease-in-out
              hover:-translate-y-2 hover:scale-[1.02]
              hover:shadow-[0_12px_24px_rgba(255,107,107,0.12),0_10px_20px_rgba(0,0,0,0.06)]
              hover:border-t-[var(--accent-primary)]
              opacity-0 animate-fadeInUpCard
            "
            style={{ animationDelay: "0.2s" }}
          >
            <h3
              className="
                font-sans text-2xl mb-4 text-[var(--accent-secondary)]
                flex items-center gap-3 pt-1
                transition-colors duration-350 ease-in-out
                hover:text-[var(--accent-primary)]
              "
            >
              <FaUsers className="text-2xl text-[var(--accent-secondary)] transition-transform duration-300 ease-in-out hover:text-[var(--accent-primary)] hover:-rotate-12 hover:scale-110" />
              Peer Support
            </h3>
            <p className="text-base text-gray-800 leading-relaxed">
              Find empathetic listeners and fellow players ready to help you
              through every challenge.
            </p>
          </div>

          <div
            className="
              bg-white rounded-2xl border-t-4 border-[var(--accent-secondary)]
              p-8
              shadow-[0_6px_12px_rgba(0,0,0,0.07),0_8px_18px_rgba(0,0,0,0.05)]
              transition-all duration-350 ease-in-out
              hover:-translate-y-2 hover:scale-[1.02]
              hover:shadow-[0_12px_24px_rgba(255,107,107,0.12),0_10px_20px_rgba(0,0,0,0.06)]
              hover:border-t-[var(--accent-primary)]
              opacity-0 animate-fadeInUpCard
            "
            style={{ animationDelay: "0.4s" }}
          >
            <h3
              className="
                font-sans text-2xl mb-4 text-[var(--accent-secondary)]
                flex items-center gap-3 pt-1
                transition-colors duration-350 ease-in-out
                hover:text-[var(--accent-primary)]
              "
            >
              <FaTheaterMasks className="text-2xl text-[var(--accent-secondary)] transition-transform duration-300 ease-in-out hover:text-[var(--accent-primary)] hover:-rotate-12 hover:scale-110" />
              Roleplay Therapy
            </h3>
            <p className="text-base text-gray-800 leading-relaxed">
              Engage in safe, guided scenarios designed to encourage growth and
              understanding.
            </p>
          </div>

          <div
            className="
              bg-white rounded-2xl border-t-4 border-[var(--accent-secondary)]
              p-8
              shadow-[0_6px_12px_rgba(0,0,0,0.07),0_8px_18px_rgba(0,0,0,0.05)]
              transition-all duration-350 ease-in-out
              hover:-translate-y-2 hover:scale-[1.02]
              hover:shadow-[0_12px_24px_rgba(255,107,107,0.12),0_10px_20px_rgba(0,0,0,0.06)]
              hover:border-t-[var(--accent-primary)]
              opacity-0 animate-fadeInUpCard
            "
            style={{ animationDelay: "0.6s" }}
          >
            <h3
              className="font-sans text-2xl mb-4 text-[var(--accent-secondary)]
                flex items-center gap-3 pt-1
                transition-colors duration-350 ease-in-out
                hover:text-[var(--accent-primary)]"
            >
              <FaCalendarAlt className="text-2xl text-[var(--accent-secondary)] transition-transform duration-300 ease-in-out hover:text-[var(--accent-primary)] hover:-rotate-12 hover:scale-110" />
              Daily Events
            </h3>
            <p className="text-base text-gray-800 leading-relaxed">
              Join fun workshops, mini-games, and group sessions tailored for
              emotional well-being.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden leading-[0]">
        <svg
          className="block w-[calc(100%+1.3px)] h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-[var(--footer-bg)]"
          />
        </svg>
      </div>
      <footer className="bg-[var(--footer-bg)] text-gray-700 text-center py-8">
        <p className="mb-2 text-[#4A4A4A]">
          © 2025 Serendipity Support Center • A Roblox Therapy Roleplay Experience
        </p>
        <p className="text-sm text-gray-600">
          Please note: This is roleplay. For professional mental health
          support, contact licensed professionals.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;