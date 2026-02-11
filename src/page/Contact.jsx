import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FaEnvelope, FaMapMarkerAlt, FaDiscord, FaArrowLeft, FaBuilding, FaIdCard } from "react-icons/fa";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-gray-200 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-gray-400/30 p-8 rounded-2xl shadow-2xl shadow-gray-400/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-400/50"></div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-xl"></div>
              <div className="relative rounded-full bg-gray-400/10 p-5 border border-gray-400/30">
                <FaEnvelope className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300">
              Contact Us
            </span>
          </h1>

          <p className="mb-10 text-gray-400 text-lg text-center max-w-2xl mx-auto leading-relaxed">
            Need help or want to get in touch with <span className="text-gray-300 font-semibold">NetherLink</span>? 
            We're happy to assist you with support, business inquiries, or feedback! 
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-300 mb-5 border-l-4 border-gray-400 pl-4">
                Company Details
              </h2>
              <div className="bg-neutral-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-400/20">
                <div className="grid gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400/30">
                      <FaBuilding className="text-gray-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Company Name</div>
                      <div className="text-gray-400">Jens-Co</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400/30">
                      <FaMapMarkerAlt className="text-gray-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Address</div>
                      <div className="text-gray-400">
                        Statiestraat 26<br />
                        1570 Tollembeek<br />
                        Belgium
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400/30">
                      <FaEnvelope className="text-gray-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Email</div>
                      <a
                        href="mailto:jenscollaert@icloud.com"
                        className="text-gray-300 hover:text-gray-200 transition-colors"
                      >
                        jenscollaert@icloud.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400/30">
                      <FaDiscord className="text-gray-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Discord</div>
                      <a
                        href="https://discord.gg/xvaNzE35Rs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-gray-200 transition-colors"
                      >
                        Join our community
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400/30">
                      <FaIdCard className="text-gray-400 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">KBO Number</div>
                      <div className="text-gray-400 font-mono">1025.363.838</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-300 mb-5 border-l-4 border-gray-400 pl-4">
                Support & Quick Contact
              </h2>
              <div className="bg-neutral-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-400/20">
                <p className="text-gray-400 leading-relaxed mb-4">
                  The quickest way to get help is via our Discord community. 
                  For business or privacy matters, please email us directly.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl border border-gray-400/10">
                    <FaEnvelope className="text-gray-400 text-lg flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email Support</div>
                      <a
                        href="mailto:jenscollaert@icloud.com"
                        className="text-gray-300 hover:text-gray-200 transition-colors font-medium"
                      >
                        jenscollaert@icloud.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl border border-gray-400/10">
                    <FaDiscord className="text-gray-400 text-lg flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Community Discord</div>
                      <a
                        href="https://discord.gg/xvaNzE35Rs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-gray-200 transition-colors font-medium"
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-300 hover:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-gray-400/30 hover:shadow-gray-400/50 hover:scale-105"
            >
              <FaArrowLeft /> Back to Home
            </Link>
          </div>

          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-gray-400/20 rounded-br-2xl"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-gray-400/20 rounded-tl-2xl"></div>
        </div>
      </div>

      <Footer />
    </div>
  );
}