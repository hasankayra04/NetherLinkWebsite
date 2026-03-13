import { FaBroadcastTower, FaInfoCircle, FaSave, FaUsers, FaBolt, FaCheckCircle, FaSitemap, FaWrench, FaQuestionCircle } from "react-icons/fa";

export default function Info() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200/40 via-white/80 to-cyan-200/60 text-blue-900 font-sans">

      <div className="max-w-4xl mx-auto px-3 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-700 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
          NetherLink Information
        </h1>

        <section className="mb-12">
          <div className="relative glass-tile-nav p-8 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/70 via-cyan-400/70 to-blue-300/40 rounded-t-2xl" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center border border-white/30">
                <FaBroadcastTower className="text-blue-400 text-xl" />
              </div>
              How NetherLink Works
            </h2>
            <div className="space-y-4 text-blue-900 leading-relaxed">
              <p>
                <b>NetherLink</b> makes any external Minecraft Bedrock server appear as a local LAN game on your console (PlayStation, Xbox). No port forwarding, no DNS tricks – just LAN broadcasting over WiFi.
              </p>
              <p>
                Our <b>intelligent relay system</b> optimizes every connection: once your console is linked, it's smart enough to conserve battery and network usage. Just select or enter a server, tap start, and play!
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-3 text-blue-800">
                <li><b>One-Tap Connection:</b> Instantly join any Bedrock server via your LAN list.</li>
                <li><b>Smart Relays:</b> Auto-failover between EU/US, minimum latency always.</li>
                <li><b>Battery Efficient:</b> Broadcasting stops once you're connected.</li>
                <li><b>No Data Sent:</b> Servers & profiles stay private on your device.</li>
              </ul>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/20 rounded-br-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-white/20 rounded-tl-2xl pointer-events-none"></div>
          </div>
        </section>

        <section className="mb-12">
          <div className="relative glass-tile-nav p-8 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/70 via-cyan-400/70 to-blue-300/40 rounded-t-2xl" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center border border-white/30">
                <FaSitemap className="text-blue-400 text-xl" />
              </div>
              NetherLink Nintendo DNS — How to use
            </h2>
            <ol className="list-decimal pl-7 space-y-3 text-blue-900">
              <li>
                <b>Connect everything to the same network</b><br />
                Make sure your phone/tablet running NetherLink and your console are on the **same Wi‑Fi** *(avoid Guest Wi‑Fi if possible)* while sending the DNS config.
              </li>
              <li>
                <b>Open NetherLink</b><br />
                Launch the app on your phone or tablet.
              </li>
              <li>
                <b>Enter your server details</b><br />
                Enter the IP/domain & port (default: <span className="font-mono text-blue-700">19132</span>) or select a saved/recommended server.
              </li>
              <li>
                <b>Select a server and toggle the DNS mode</b><br />
                Tap on the server you prefer and toggle Nintendo Switch (DNS mode).
              </li>
              <li>
                <b>Send DNS Config</b><br />
                Tap "Send DNS Config" in the app – NetherLink pushes the configuration to its servers.
              </li>
              <li>
                <b>Set your console's DNS</b><br />
                Set your console's DNS to the IP you were provided as the primary DNS, and leave the secondary DNS field blank.
              </li>
              <li>
                <b>Join from your console</b><br />
                In Minecraft on your console, go to Servers. You'll see servers with the MOTD "NetherLink RelayServer" — join any to connect!
              </li>
            </ol>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/20 rounded-br-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-white/20 rounded-tl-2xl pointer-events-none"></div>
          </div>
        </section>

        <section className="mb-12">
          <div className="relative glass-tile-nav p-8 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/70 via-cyan-400/70 to-blue-300/40 rounded-t-2xl" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center border border-white/30">
                <FaWrench className="text-blue-400 text-xl" />
              </div>
              🔧 Can't Connect? Troubleshooting Guide
            </h2>
            <div className="space-y-5 text-blue-900">
              <div>
                <h3 className="font-semibold mb-2 text-blue-800">✅ Basic Checks</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Same WiFi Network: phone/tablet and console MUST be on the same WiFi</li>
                  <li>Correct Server Address: Double-check IP and port (default: 19132)</li>
                  <li>Broadcasting Active: NetherLink must show "Broadcasting" status</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-blue-800">🔄 Quick Fixes</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Restart the app: Stop broadcast, close NetherLink, reopen</li>
                  <li>Restart your console: Sometimes a reboot helps LAN detection</li>
                  <li>Check Friends/LAN tab: Not in serverlist, but in "Friends"/"LAN Games"</li>
                  <li>Wait 10-15 seconds: Discovery can take a moment after starting</li>
                  <li>Disable VPN: VPNs often block LAN broadcasting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-blue-800">⚠️ Common Issues</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <span className="font-mono">No route found for user</span> — Make sure your phone/tablet running NetherLink and your console are on the same Wi‑Fi (avoid Guest Wi‑Fi if possible).
                  </li>
                  <li>
                    <span className="font-mono">Unable to connect to NetherLink relay server</span> — Check your internet, relay server may be temporarily offline.
                  </li>
                  <li>
                    <span className="font-mono">Server appears but won't connect</span> — Target Minecraft server may be offline or unreachable.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-blue-800">📱 Still Having Issues?</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Enable Debug Mode in NetherLink for detailed logs</li>
                  <li>Check your device isn’t on low power mode (might stop background tasks)</li>
                  <li>Try a different server to confirm NetherLink itself is working</li>
                </ul>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/20 rounded-br-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-white/20 rounded-tl-2xl pointer-events-none"></div>
          </div>
        </section>

        <section className="mb-12">
          <div className="relative glass-tile-nav p-8 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/70 via-cyan-400/70 to-blue-300/40 rounded-t-2xl" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center border border-white/30">
                <FaInfoCircle className="text-blue-400 text-xl" />
              </div>
              Core Features (v2.x)
            </h2>
            <div className="space-y-4 grid md:grid-cols-2 gap-5">
              {[
                {
                  icon: <FaCheckCircle className="text-blue-500" />,
                  title: "Zero Setup",
                  desc: "No port forwarding, DNS changes, or extra accounts. Works out-of-the-box on any Bedrock server.",
                },
                {
                  icon: <FaSave className="text-blue-500" />,
                  title: "Saveable Server List",
                  desc: "Bookmarks for your servers: no need to retype IPs, just select and connect.",
                },
                {
                  icon: <FaUsers className="text-blue-500" />,
                  title: "Multiple Bedrock Profiles",
                  desc: "Switch between different gamertags or family accounts instantly.",
                },
                {
                  icon: <FaBolt className="text-blue-500" />,
                  title: "Intelligent Relay & Auto Failover",
                  desc: "Always the fastest relay is used, fallback to EU/US — never get stuck.",
                },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/30 border border-white/20 rounded-xl px-4 py-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-white/50 rounded-full shadow">{f.icon}</div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">{f.title}</h4>
                    <p className="text-blue-800">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/20 rounded-br-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-white/20 rounded-tl-2xl pointer-events-none"></div>
          </div>
        </section>
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
