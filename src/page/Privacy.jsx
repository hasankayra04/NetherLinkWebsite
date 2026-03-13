import { Link } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200/40 via-white/80 to-cyan-200/60 text-blue-900 font-sans">
      <div className="max-w-4xl mx-auto px-3 py-12">
        <div className="relative glass-tile-nav p-8 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/70 via-cyan-400/70 to-blue-300/40 rounded-t-2xl" />
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-300/20 rounded-full blur-xl" />
              <div className="relative rounded-full bg-white/30 p-5 border border-white/30 backdrop-blur-xl">
                <FaShieldAlt className="w-12 h-12 text-blue-400 drop-shadow" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-700 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="mb-10 text-blue-800 text-lg text-center max-w-2xl mx-auto leading-relaxed">
            At <span className="font-semibold">NetherLink</span>, we are committed to protecting your privacy.   
            This policy outlines what information we collect and how we use it.
          </p>

          <div className="space-y-6">
            {[
              { title: "1. Application Data", content: "NetherLink stores data locally on your device to enhance your experience:", list: ["Your saved server list (IP addresses, ports, custom names)", "Bedrock profile information (usernames and display names)", "App preferences and settings"], footer: "All data is stored locally on your device. We do not collect, transmit, or store any personal information on external servers." },
              { title: "2. Network Activity", content: "NetherLink acts as a UDP proxy between your console and remote Minecraft servers. The app only processes game traffic necessary for connectivity and does not log, monitor, or store any gameplay data, chat messages, or player information." },
              { title: "3. Featured Servers List", content: "The app downloads a public list of featured servers from our GitHub repository and backend API. This list contains only server addresses, ports, and optional banner images. No personal data is transmitted when fetching this list." },
              { title: "4. Data Security", content: "Since all data is stored locally on your device, you maintain full control over your information. We recommend securing your device with a password or biometric authentication to protect your saved servers and profiles." },
              { title: "5. Third-Party Services", content: "NetherLink does not integrate third-party analytics, advertising, or tracking services. App Store and Google Play may collect standard installation and usage metrics according to their own privacy policies." },
              { title: "6. Children's Privacy", content: "NetherLink does not knowingly collect any personal information from children. All data remains on the user's device and is never transmitted to external servers." },
              { title: "7. Data Removal", content: "You can delete all saved data at any time by uninstalling the app or clearing app data through your device settings. Since no data is stored on our servers, uninstalling the app completely removes all information." },
              { title: "8. Changes to This Policy", content: "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date." }
            ].map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold mb-3 border-l-4 border-cyan-400 pl-4 bg-transparent">
                  {section.title}
                </h2>
                <div className="bg-white/40 backdrop-blur rounded-xl p-5 border border-white/20">
                  <p className="text-blue-900 leading-relaxed mb-3">{section.content}</p>
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-2 text-blue-800 mb-3">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.footer && (
                    <p className="text-blue-900 leading-relaxed">{section.footer}</p>
                  )}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 text-sm text-blue-600 text-right font-medium">
            Last updated: January 2026
          </p>

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