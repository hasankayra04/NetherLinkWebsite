import { Link } from "react-router-dom";

import { FaEnvelope, FaMapMarkerAlt, FaDiscord, FaArrowLeft, FaBuilding, FaIdCard } from "react-icons/fa";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200/40 via-white/80 to-cyan-200/60 text-blue-900 font-sans">

      <div className="max-w-4xl mx-auto px-3 py-12">
        <div className="relative glass-tile-nav p-8 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/70 via-cyan-400/70 to-blue-300/40 rounded-t-2xl" />
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-300/20 rounded-full blur-xl" />
              <div className="relative rounded-full bg-white/30 p-5 border border-white/30 backdrop-blur-xl">
                <FaEnvelope className="w-12 h-12 text-blue-400 drop-shadow" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-700 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
            Contact Us
          </h1>

          <p className="mb-10 text-blue-800 text-lg text-center max-w-2xl mx-auto leading-relaxed">
            Need help or want to get in touch with <span className="font-semibold">NetherLink</span>? 
            We're happy to assist you with support, business inquiries, or feedback!
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-5 border-l-4 border-cyan-400 pl-4">
                Company Details
              </h2>
              <div className="bg-white/40 backdrop-blur rounded-xl p-6 border border-white/20">
                <div className="grid gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                      <FaBuilding className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold mb-1">Company Name</div>
                      <div className="text-blue-700">Jens-Co</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                      <FaMapMarkerAlt className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold mb-1">Address</div>
                      <div className="text-blue-700">
                        Statiestraat 26<br />
                        1570 Tollembeek<br />
                        Belgium
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                      <FaEnvelope className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold mb-1">Email</div>
                      <a
                        href="mailto:jenscollaert@icloud.com"
                        className="text-blue-800 hover:text-blue-600 transition-colors"
                      >
                        jenscollaert@icloud.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                      <FaDiscord className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold mb-1">Discord</div>
                      <a
                        href="https://discord.gg/xvaNzE35Rs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:text-blue-600 transition-colors"
                      >
                        Join our community
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
                      <FaIdCard className="text-blue-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold mb-1">KBO Number</div>
                      <div className="text-blue-700 font-mono">1025.363.838</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-5 border-l-4 border-cyan-400 pl-4">
                Support & Quick Contact
              </h2>
              <div className="bg-white/40 backdrop-blur rounded-xl p-6 border border-white/20">
                <p className="text-blue-900 leading-relaxed mb-4">
                  The quickest way to get help is via our Discord community. For business or privacy matters, please email us directly.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 glass-tile-nav border border-white/15">
                    <FaEnvelope className="text-blue-400 text-lg flex-shrink-0" />
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Email Support</div>
                      <a
                        href="mailto:jenscollaert@icloud.com"
                        className="text-blue-900 hover:text-blue-600 transition-colors font-medium"
                      >
                        jenscollaert@icloud.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 glass-tile-nav border border-white/15">
                    <FaDiscord className="text-blue-400 text-lg flex-shrink-0" />
                    <div>
                      <div className="text-sm text-blue-700 mb-1">Community Discord</div>
                      <a
                        href="https://discord.gg/xvaNzE35Rs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-900 hover:text-blue-600 transition-colors font-medium"
                      >
                        discord.gg/xvaNzE35Rs
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 glass-tile-nav text-blue-900 font-bold rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <FaArrowLeft /> Back to Home
            </Link>
          </div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/20 rounded-br-2xl pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-white/20 rounded-tl-2xl pointer-events-none"></div>
        </div>
      </div>

      <style jsx="true">{`
        .glass-tile-nav {
          background: linear-gradient(115deg,rgba(255,255,255,0.54),rgba(158,235,255,0.13) 100%);
          box-shadow: 0 1.5px 14px 0 rgba(50,100,255,0.11);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }
      `}</style>
    </div>
  );
}