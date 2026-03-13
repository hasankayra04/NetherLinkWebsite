import { FaWindows, FaApple, FaAndroid } from "react-icons/fa";

const platforms = [
  {
    icon: <FaWindows size={32} />,
    label: "Windows",
    url: "https://apps.microsoft.com/detail/9NSFPT6D8PTR"
  },
  {
    icon: <FaApple size={32} />,
    label: "macOS",
    url: "https://github.com/NetherLinkMC/NetherLinkWebsite/raw/refs/heads/main/downloads/apple/NetherLink.dmg"
  },
  {
    icon: <FaAndroid size={32} />,
    label: "Android",
    url: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink"
  },
  {
    icon: <FaApple size={32} />,
    label: "iOS",
    url: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en"
  },
];

const features = [
  "One-Tap to Any Bedrock Server",
  "Works with PlayStation, Xbox, Switch & mobile",
  "No port forwarding needed",
  "Instant LAN discovery on console",
  "Zero added latency (UDP tunneling)",
  "All data private: nothing ever uploaded"
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-200/40 via-white/80 to-cyan-200/40">
      <main className="flex-1 w-full flex flex-col items-center px-4 sm:px-0">
        <section className="max-w-2xl pt-28 sm:pt-36 pb-10 mx-auto text-center flex flex-col gap-6">
          <h1 className="text-[2.2rem] sm:text-5xl font-extrabold bg-gradient-to-r from-blue-900 via-blue-500 to-cyan-400 bg-clip-text text-transparent leading-tight drop-shadow-sm">
            Turn Any Minecraft Server Into Local Play
          </h1>
          <p className="text-gray-800 text-lg font-medium drop-shadow-sm">
            Connect your console to any Bedrock server—see it instantly in your LAN/Friends list. Zero config, zero hassle. Just play.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 justify-center mt-6 w-full">
            {platforms.map((p) => (
              <a
                key={p.label}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl flex flex-col items-center justify-center h-32 w-full min-w-[140px] max-w-xs mx-auto
                  glass-tile shadow-lg border border-white/20 bg-white/30 hover:bg-white/60 transition-all cursor-pointer group backdrop-blur-lg"
                style={{
                  boxShadow:
                    "0 3px 24px 0 rgb(94 190 255 / 0.06), 0 1.5px 7px 0 rgb(0 0 0 / 0.11)"
                }}
              >
                <span className="text-blue-600 mb-2 group-hover:scale-110 transition-transform">{p.icon}</span>
                <span className="font-semibold text-blue-900 text-base">{p.label}</span>
              </a>
            ))}
          </div>
        </section>
        <section className="w-full max-w-2xl mb-16 mt-1">
          <ul className="grid sm:grid-cols-2 gap-3 bg-white/40 border border-white/30 rounded-2xl shadow p-7 text-base text-blue-900 font-medium backdrop-blur-md glass-tile">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full" />
                {f}
              </li>
            ))}
          </ul>
        </section>
        <section className="w-full max-w-xl mb-20">
          <div className="bg-white/40 border border-white/30 rounded-2xl px-6 py-5 text-base text-blue-800 shadow backdrop-blur-md glass-tile">
            <b>What's New:</b> Fallback relays, notification banners, manual relay pick, Nintendo Switch support, better status logs.
          </div>
        </section>
      </main>
      <style jsx="true">{`
        .glass-tile {
          background: linear-gradient(120deg,rgba(255,255,255,0.33) 40%,rgba(117,230,255,0.15) 100%);
          box-shadow: 0 4px 32px 0 rgba(50,100,255,0.07);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
      `}</style>
    </div>
  );
}