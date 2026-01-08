import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-200 font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50"></div>
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl"></div>
              <div className="relative rounded-full bg-cyan-500/10 p-5 border border-cyan-500/30">
                <FaShieldAlt className="w-12 h-12 text-cyan-400" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500">
              Privacy Policy
            </span>
          </h1>
          
          <p className="mb-10 text-gray-400 text-lg text-center max-w-2xl mx-auto leading-relaxed">
            At <span className="text-cyan-400 font-semibold">NetherLink</span>, we are committed to protecting your privacy.   
            This policy outlines what information we collect and how we use it.
          </p>

          <div className="space-y-6">
            {[
              { title: "1. Application Data", content: "NetherLink stores data locally on your device to enhance your experience:", list: ["Your saved server list (IP addresses, ports, custom names)", "Bedrock profile information (usernames and display names)", "App preferences and settings"], footer: "All data is stored locally on your device.  We do not collect, transmit, or store any personal information on external servers." },
              { title: "2. Network Activity", content: "NetherLink acts as a UDP proxy between your console and remote Minecraft servers. The app only processes game traffic necessary for connectivity and does not log, monitor, or store any gameplay data, chat messages, or player information." },
              { title: "3. Featured Servers List", content: "The app downloads a public list of featured servers from our GitHub repository and backend API. This list contains only server addresses, ports, and optional banner images. No personal data is transmitted when fetching this list." },
              { title: "4. Data Security", content: "Since all data is stored locally on your device, you maintain full control over your information. We recommend securing your device with a password or biometric authentication to protect your saved servers and profiles." },
              { title: "5. Third-Party Services", content: "NetherLink does not integrate third-party analytics, advertising, or tracking services. App Store and Google Play may collect standard installation and usage metrics according to their own privacy policies." },
              { title: "6. Children's Privacy", content: "NetherLink does not knowingly collect any personal information from children. All data remains on the user's device and is never transmitted to external servers." },
              { title: "7. Data Removal", content: "You can delete all saved data at any time by uninstalling the app or clearing app data through your device settings. Since no data is stored on our servers, uninstalling the app completely removes all information." },
              { title: "8. Changes to This Policy", content: "We may update this privacy policy from time to time.  Any changes will be posted on this page with an updated revision date." }
            ].map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold text-cyan-400 mb-3 border-l-4 border-cyan-500 pl-4">
                  {section.title}
                </h2>
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-5 border border-cyan-500/20">
                  <p className="text-gray-400 leading-relaxed mb-3">{section.content}</p>
                  {section. list && (
                    <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-3">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.footer && (
                    <p className="text-gray-400 leading-relaxed">{section.footer}</p>
                  )}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 text-sm text-gray-500 text-right font-medium">
            Last updated: January 2026
          </p>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
            >
              <FaArrowLeft /> Back to Home
            </Link>
          </div>
          
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-cyan-500/20 rounded-br-2xl"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-2xl"></div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}