import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FaGavel, FaArrowLeft } from "react-icons/fa";

export default function Terms() {
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
                <FaGavel className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300">
              Terms of Service
            </span>
          </h1>
          
          <p className="mb-10 text-gray-400 text-lg text-center max-w-2xl mx-auto leading-relaxed">
            By accessing or using <span className="text-gray-300 font-semibold">NetherLink</span>, 
            you agree to these terms. Please read them carefully.  
          </p>

          <div className="space-y-6">
            {[
              { 
                title: "1. Use of the Application", 
                content: "You may use NetherLink for lawful purposes only. You agree not to use the app to connect to servers that violate Minecraft's Terms of Service or engage in illegal activities. You are responsible for ensuring you have permission to connect to any server you access through NetherLink." 
              },
              { 
                title: "2. Server Listings", 
                content: "The featured servers list is provided as a community resource. We do not endorse, verify, or control the content of third-party Minecraft servers. Server owners are solely responsible for their server's content, rules, and compliance with applicable laws. We reserve the right to remove servers from our featured list without notice." 
              },
              { 
                title: "3. No Warranty", 
                content: "NetherLink is provided \"as is\" without warranties of any kind. We do not guarantee:", 
                list: [
                  "Uninterrupted or error-free operation",
                  "Compatibility with all network configurations",
                  "Connection stability to third-party servers",
                  "Availability of featured servers"
                ]
              },
              { 
                title: "4. Limitation of Liability", 
                content: "We are not responsible for any damages, data loss, or issues arising from your use of NetherLink, including but not limited to connection problems, server bans, or interaction with third-party servers. Use the app at your own risk." 
              },
              { 
                title: "5. Intellectual Property", 
                content: "NetherLink and its source code are the intellectual property of the development team. The app is provided free of charge for personal use. You may not reverse engineer, modify, or redistribute the app without explicit permission. Server banners and data provided by third parties remain the property of their respective owners." 
              },
              { 
                title: "6. Minecraft and Microsoft", 
                content: "NetherLink is an independent project and is not affiliated with, endorsed by, or sponsored by Mojang Studios, Microsoft Corporation, or Minecraft. \"Minecraft\" is a trademark of Microsoft Corporation." 
              },
              { 
                title: "7. User Conduct", 
                content: "You agree not to:", 
                list: [
                  "Use the app to attack, exploit, or disrupt servers or networks",
                  "Attempt to circumvent server bans or access restrictions",
                  "Share or distribute malicious server addresses",
                  "Violate any applicable laws or regulations"
                ]
              },
              { 
                title: "8. Open Source", 
                content: "NetherLink is open-source software. The source code is available on GitHub for review and contribution. By contributing code or suggestions, you grant us the right to use and distribute your contributions under the project's license." 
              },
              { 
                title: "9. Modifications to Terms", 
                content: "We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of the app after changes constitutes acceptance of the new terms." 
              },
              { 
                title: "10. Contact", 
                content: "For questions, concerns, or support regarding NetherLink, please join our Discord community or open an issue on our GitHub repository." 
              }
            ].map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold text-gray-300 mb-3 border-l-4 border-gray-400 pl-4">
                  {section.title}
                </h2>
                <div className="bg-neutral-800/50 backdrop-blur-xl rounded-xl p-5 border border-gray-400/20">
                  <p className="text-gray-400 leading-relaxed">{section.content}</p>
                  {section.list && (
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-400">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
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