import { FaDiscord } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function FeaturedSlot() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200/40 via-white/80 to-cyan-200/60 text-blue-900 font-sans flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-0 py-10">
        <div className="glass-tile-nav w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border border-white/20">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-blue-700 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
            Featured Server Slot
          </h1>
          <div className="mb-4 text-blue-800 text-center">
            Showcase your Minecraft Bedrock server in the <b>Featured</b> section of NetherLink.
          </div>
          <div className="mb-5 text-center">
            <span className="block text-xl font-bold mb-1">Price:</span>
            <span className="text-blue-700 text-2xl font-semibold">$50 <span className="font-normal italic text-blue-900">/ month</span></span><br />
            <div className="text-blue-800 text-xs mt-1">
              The price for the IP/Port placeholder within the NetherLink app is to be discussed.
            </div>
          </div>
          <div className="mb-4 text-center">
            <b>How to arrange your slot?</b><br />
            Contact <span className="font-semibold text-blue-700">Jens.Co</span> on Discord:<br />
            or join our{" "}
            <a href="https://discord.gg/xvaNzE35Rs" className="underline text-blue-700 hover:text-blue-900" target="_blank" rel="noopener noreferrer">
              <FaDiscord className="inline-block mr-1" /> Discord server
            </a>.
          </div>
          <p className="text-xs text-blue-600 mt-6 text-center">
            Your slot helps support NetherLink development and keeps the service online for everyone!
          </p>
          {/* Terms of Service link */}
          <div className="mt-6 text-center">
            <Link
              to="/terms"
              className="inline-block text-xs text-blue-800 underline hover:text-blue-900 transition font-medium"
            >
              View Terms of Service
            </Link>
          </div>
        </div>
      </main>
      <style jsx="true">{`
        .glass-tile-nav {
          background: linear-gradient(115deg,rgba(255,255,255,0.93) 75%,rgba(158,235,255,0.15) 100%);
          box-shadow: 0 8px 48px 0 rgba(0,0,0,0.13);
          backdrop-filter: blur(18px);
        }
      `}</style>
    </div>
  );
}