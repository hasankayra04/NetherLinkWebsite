import { Link } from "react-router-dom";
import { FaGavel, FaArrowLeft } from "react-icons/fa";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200/40 via-white/80 to-cyan-200/60 text-blue-900 font-sans">
      <div className="max-w-4xl mx-auto px-3 py-12">
        <div className="relative glass-tile-nav p-8 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/70 via-cyan-400/70 to-blue-300/40 rounded-t-2xl" />
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-300/20 rounded-full blur-xl" />
              <div className="relative rounded-full bg-white/30 p-5 border border-white/30 backdrop-blur-xl">
                <FaGavel className="w-12 h-12 text-blue-400 drop-shadow" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-700 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="mb-10 text-blue-800 text-lg text-center max-w-2xl mx-auto leading-relaxed">
            By accessing or using <span className="font-semibold">NetherLink</span>,
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
              },
              {
                title: "11. Featured Server Slots (Paid Service)",
                content: `NetherLink offers the option to feature your server in the application for a monthly fee. The following conditions apply:`,
                list: [
                  "Payment is collected securely via Stripe on a recurring monthly basis.",
                  "You may cancel your slot at any time; simply notify us on Discord or by email. Your slot will remain active until the end of your paid period.",
                  "If your payment cannot be processed (for example, due to an expired card), the slot will remain active until the end of your current billing month. After this, your featured server will be removed.",
                  "Refunds: We offer a satisfaction guarantee. If you are not satisfied with the service, you may request a full refund for your current month, no questions asked.",
                  "All agreements and custom arrangements are discussed personally via Discord (jens.co) or email (see contact page).",
                  "**Pricing Changes:** NetherLink reserves the right to change the price for Featured Server Slots. Price changes will be announced in advance, and new pricing will apply from your next billing period."
                ]
              }
            ].map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold mb-3 border-l-4 border-cyan-400 pl-4 bg-transparent">{section.title}</h2>
                <div className="bg-white/40 backdrop-blur rounded-xl p-5 border border-white/20">
                  <p className="text-blue-900 leading-relaxed">{section.content}</p>
                  {section.list && (
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-blue-800">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 text-sm text-blue-600 text-right font-medium">
            Last updated: March 2026
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