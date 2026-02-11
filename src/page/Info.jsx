import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FaServer, FaInfoCircle, FaSave, FaUsers } from "react-icons/fa";

export default function Info() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-gray-200 font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300">
            NetherLink Information
          </span>
        </h1>
        
        <section className="mb-12">
          <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-gray-400/30 p-8 rounded-2xl shadow-2xl shadow-gray-400/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-400/50"></div>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-300 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center border border-gray-400/30">
                <FaServer className="text-xl" />
              </div>
              Featured Servers System
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3 text-white">
                  How does the rotation system work?
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Our featured servers system is designed to provide maximum fairness and visibility for all participating servers, regardless of when they were added. 
                </p>
              </div>
              
              {[
                { title: "Backend Rotation", desc: "Every minute, the order of servers is shifted, ensuring all servers regularly appear at the top. This happens on the server, so whenever someone loads the page, they see a different order." },
                { title: "Daily Shuffle", desc: "Every day, all servers are reshuffled. This ensures a completely new starting order and prevents servers from being stuck in a particular pattern." },
                { title: "Frontend Rotation", desc: "Even while staying on the website, the servers are automatically rotated every 5 seconds. The top server moves to the bottom, and the next one appears at the top." },
                { title: "Why this is fair", desc: "This three-layer rotation system ensures that:", list: ["All servers get an equal chance to be at the top", "The position of servers constantly changes", "There is no preference for servers based on when they were added", "Even with hundreds of servers, everyone gets their turn"] }
              ].map((item, i) => (
                <div key={i} className="bg-neutral-800/50 backdrop-blur-xl border border-gray-400/20 rounded-xl p-6 hover:border-gray-400/40 transition-all duration-300">
                  <h4 className="text-lg font-medium mb-3 text-gray-300">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 leading-relaxed mb-2">{item.desc}</p>
                  {item.list && (
                    <ul className="list-disc pl-6 space-y-2 text-gray-400">
                      {item.list.map((point, j) => (
                        <li key={j}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-gray-400/20 rounded-br-2xl"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-gray-400/20 rounded-tl-2xl"></div>
          </div>
        </section>
        
        <section className="mb-12">
          <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-gray-400/30 p-8 rounded-2xl shadow-2xl shadow-gray-400/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-400/50"></div>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-300 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center border border-gray-400/30">
                <FaInfoCircle className="text-xl" />
              </div>
              About NetherLink
            </h2>
            
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                NetherLink is a lightweight app that allows Minecraft: Bedrock Edition players on consoles like PlayStation, Xbox, and Nintendo Switch to connect to external servers using the LAN multiplayer menu. 
              </p>

              <p>
                It works by broadcasting a virtual LAN server on your local network. When a console searches for LAN games, it discovers NetherLink's proxy server. Upon connection, players are automatically redirected to a remote Minecraft server of your choice — even if it's hosted externally.
              </p>

              <p>
                NetherLink supports both IPv4 and IPv6, provides real-time logs in the interface, and includes start/stop control with automatic socket management. It's ideal for GeyserMC-based servers and simplifies the process of joining online servers from closed platforms.
              </p>

              <p>
                No complicated setup, no DNS changes, no extra apps — just launch NetherLink, set your server address, and start playing. Whether you're hosting a server for friends or running a public Bedrock server, NetherLink makes access seamless for everyone.
              </p>
            </div>

            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-gray-400/20 rounded-br-2xl"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-gray-400/20 rounded-tl-2xl"></div>
          </div>
        </section>

        <section className="mb-12">
          <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-gray-400/30 p-8 rounded-2xl shadow-2xl shadow-gray-400/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-400/50"></div>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-300 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-400/10 rounded-xl flex items-center justify-center border border-gray-400/30">
                <FaSave className="text-xl" />
              </div>
              New in v2.0
            </h2>
            
            <div className="space-y-5">
              {[
                { icon: FaSave, title: "Saveable Server List", desc: "Save your favorite servers for quick access. No more typing IP addresses every time - just select from your saved list and connect instantly." },
                { icon: FaUsers, title: "Multiple Bedrock Profiles", desc: "Create and manage multiple Bedrock Edition profiles with custom display names. Perfect for families sharing one device or players with multiple accounts." },
                { icon: null, title: "Modern UI Design", desc: "Completely redesigned interface with sleek aesthetics, smooth animations, and improved user experience across all platforms." }
              ].map((feature, i) => (
                <div key={i} className="bg-neutral-800/50 backdrop-blur-xl border border-gray-400/20 rounded-xl p-6 hover:border-gray-400/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-400/30">
                      {feature.icon ? (
                        <feature.icon className="text-2xl text-gray-400" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2 text-white">
                        {feature.title}
                      </h4>
                      <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-gray-400/20 rounded-br-2xl"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-gray-400/20 rounded-tl-2xl"></div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}