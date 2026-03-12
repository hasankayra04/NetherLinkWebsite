import { useState, useEffect } from "react";
import { FaWindows, FaApple, FaAndroid} from "react-icons/fa";
import { SiApple } from "react-icons/si";
import Footer from "../Footer";
import Navbar from "../Navbar";

export default function Home() {
  
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-gray-100 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-400/20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-400/5 via-transparent to-transparent"></div>
        
        {/* Animated orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-6 hover:bg-white/10 transition-all duration-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-sm font-semibold">v2.0 • Multi-Profile • Saveable Servers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300">
                Connecting Made Easy
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed font-light">
              Experience seamless Minecraft multiplayer with NetherLink's advanced UDP tunneling - turning remote servers into local LAN experiences
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-500 mx-auto shadow-lg shadow-gray-400/50"></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <main className="flex-1">
            {/* Download Section */}
            <section id="download" className="relative bg-neutral-900/50 backdrop-blur-xl py-10 px-6 text-center shadow-2xl shadow-gray-400/10 rounded-2xl mb-12 overflow-hidden border border-gray-400/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-400/50"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 text-gray-300">
                  Download NetherLink
                </h3>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto font-light">
                  Choose your platform
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[
                    { icon: FaWindows, label: "Windows", color: "from-blue-600 to-blue-700", href: "https://apps.microsoft.com/detail/9NSFPT6D8PTR" },
                    { icon: FaApple, label: "macOS", color: "from-gray-600 to-gray-700", href: "https://github.com/NetherLinkMC/NetherLinkWebsite/raw/refs/heads/main/downloads/apple/NetherLink.dmg" },
                    { icon: FaAndroid, label: "Android", color: "from-green-600 to-green-700", href: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink" },
                    { icon: SiApple, label: "iOS", color: "from-slate-700 to-slate-800", href: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en" }
                  ].map((platform, i) => {
                    const Component = platform.href ? 'a' : 'button';
                    return (
                      <Component
                        key={i}
                        {...(platform.href ? { href: platform.href, target: "_blank", rel: "noopener noreferrer" } : { onClick: platform.onClick })}
                        className="group relative"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
                        <div className={`relative bg-gradient-to-br ${platform.color} hover:scale-105 transition-all duration-300 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl border border-white/10 group-hover:border-white/20`}>
                          <platform.icon className="text-5xl text-white mb-3 group-hover:scale-110 transition-transform duration-300" />
                          <span className="font-bold text-white text-sm">{platform.label}</span>
                        </div>
                      </Component>
                    );
                  })}
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-gray-400/20 rounded-br-2xl"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-gray-400/20 rounded-tl-2xl"></div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-6">
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-300">
                Powerful Features
              </h3>
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  { icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9", title: "Direct UDP Tunneling", desc: "Virtual LAN server with seamless remote connection", color: "gray" },
                  { icon: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4", title: "Saveable Servers", desc: "Quick access to your favorite servers", color: "gray" },
                  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", title: "Multi-Profile Support", desc: "Manage multiple Bedrock accounts", color: "neutral" },
                  { icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", title: "Console Compatible", desc: "PlayStation, Xbox, Switch supported", color: "stone" }
                ].map((feature, i) => (
                  <div key={i} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-400/10 to-${feature.color}-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                    <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-neutral-700/50 group-hover:border-gray-400/40 p-5 rounded-2xl transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400/30">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-gray-300 transition-colors duration-300">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2.5s ease-in-out;
        }
        .animate-fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
        @keyframes fadeOut {
          to { opacity: 0; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(156, 163, 175, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
}
