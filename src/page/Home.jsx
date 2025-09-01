import { useState, useEffect } from "react";
import { FaWindows, FaApple, FaServer, FaGamepad, FaAndroid } from "react-icons/fa";
import { SiApple } from "react-icons/si";
import Footer from "../Footer";
import Navbar from "../Navbar";
import WindowsDownloadModal from "./WindowsDownloadModal";

export default function Home() {
  const [windowsModalOpen, setWindowsModalOpen] = useState(false);
  const [servers, setServers] = useState([]);
  const [rotatedServers, setRotatedServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rotationProgress, setRotationProgress] = useState(0);
  
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch("https://backend.netherlink.net/api/servers")
      .then((res) => res.json())
      .then((data) => {
        setServers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load servers:", err);
        fetch(
          "https://raw.githubusercontent.com/NetherLinkMC/NetherLinkServerList/refs/heads/main/servers.json"
        )
          .then((res) => res.json())
          .then((data) => {
            setServers(data);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Failed to load all servers:", err);
            setIsLoading(false);
          });
      });
  }, []);

  useEffect(() => {
    if (servers.length === 0) return;

    setRotatedServers(servers);
    setRotationProgress(0);

    const rotationInterval = 5000;
    const updateInterval = 50; 
    
    const progressTimer = setInterval(() => {
      setRotationProgress(prev => {
        const newProgress = prev + (updateInterval / rotationInterval * 100);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, updateInterval);

    const rotationTimer = setInterval(() => {
      setRotatedServers((current) => {
        if (current.length === 0) return current;
        const [first, ...rest] = current;
        return [...rest, first];
      });
      setRotationProgress(0);
    }, rotationInterval);

    return () => {
      clearInterval(rotationTimer);
      clearInterval(progressTimer);
    };
  }, [servers]);

  useEffect(() => {
    if (windowsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [windowsModalOpen]);

  const copyToClipboard = (address, port) => {
    const textToCopy = `${address}:${port}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        const toast = document.createElement("div");
        toast.className = "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl z-50 animate-fade-in-out";
        toast.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied ${textToCopy}</div>`;
        document.body.appendChild(toast);

        setTimeout(() => {
          toast.classList.add("animate-fade-out");
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 2000);
      })
      .catch(() => {
        alert("Failed to copy to clipboard");
      });
  };

  const serverList = (
    <aside className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg w-full md:max-w-sm md:sticky md:top-20 md:h-[calc(100vh-5rem)] overflow-y-auto ml-0 md:ml-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg text-emerald-400 font-bold flex items-center">
          <FaServer className="mr-2" /> Featured Servers
        </h2>
        {servers.length > 1 && (
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            5s rotation
          </span>
        )}
      </div>

      {servers.length > 1 && (
        <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all ease-linear"
            style={{ width: `${rotationProgress}%` }}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="pixel-spinner">
              <div className="pixel-spinner-inner"></div>
            </div>
          </div>
        ) : servers.length === 0 ? (
          <div className="text-gray-400 text-center py-8 bg-gray-750 rounded-lg border border-gray-600">
            <FaGamepad className="mx-auto text-3xl mb-2 text-gray-500" />
            <p>No servers found</p>
          </div>
        ) : (
          rotatedServers.map(({ name, address, port, background }, index) => {
            const validBackground = background && 
              (background.startsWith('http://') || 
               background.startsWith('https://') || 
               background.startsWith('/'));
            
            return (
              <div
                key={`${address}:${port}`}
                className={`rounded-lg ${index === 0 ? 'border-2 border-emerald-500' : 'border border-gray-600'} shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-emerald-600/20 hover:shadow-lg relative group overflow-hidden h-[140px]`}
                onClick={() => copyToClipboard(address, port)}
                title={`Click to copy ${address}:${port}`}
              >
                {validBackground ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{
                      backgroundImage: `url(${background})`,
                      filter: 'brightness(0.9)'
                    }}
                  ></div>
                ) : (
                  <div className="absolute inset-0 bg-gray-700"></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 flex flex-col justify-end">
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs px-2 py-1 font-medium z-10">
                      TOP
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <span className="bg-black/70 px-2 py-1 rounded text-sm text-gray-200 relative z-10">
                      {address}:{port}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-emerald-500 text-white text-xs px-3 py-2 rounded font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Click to copy server address
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Navbar />
      
      {isMounted && (
        <WindowsDownloadModal 
          isOpen={windowsModalOpen} 
          onClose={() => setWindowsModalOpen(false)} 
        />
      )}
      
      <div className="relative bg-gray-900 overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="cubes"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-emerald-400 pixelated">
              Connecting made easy
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
      Experience seamless Minecraft multiplayer with NetherLink's advanced UDP tunneling - turning remote servers into local LAN experiences            </p>
            <div className="w-24 h-1 bg-emerald-500 mx-auto mb-8 mt-4"></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <main className="flex-1">
            <section
              id="download"
              className="relative bg-gray-800 py-10 px-6 text-center shadow-xl rounded-lg mb-12 overflow-hidden gaming-card"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-600"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 text-emerald-400">
                  Download NetherLink
                </h3>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                  Choose your platform you want to run NetherLink on:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <div className="flex-1">
                    <button
                      onClick={() => setWindowsModalOpen(true)}
                      className="windows-modal-trigger bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg focus:outline-none w-full transition gaming-button"
                      aria-haspopup="dialog"
                    >
                      <FaWindows className="text-lg" />
                      Windows
                    </button>
                  </div>

                  <div className="flex-1">
                    <a
                      href="https://github.com/NetherLinkMC/NetherLinkWebsite/raw/refs/heads/main/downloads/apple/NetherLink.dmg"
                      className="bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg focus:outline-none w-full transition gaming-button"
                    >
                      <FaApple className="text-lg" />
                      Mac
                    </a>
                  </div>

                  <div className="flex-1">
                    <a
                      href="https://play.google.com/store/apps/details?id=net.netherdev.netherLink"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-500 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg focus:outline-none w-full transition gaming-button"
                    >
                      <FaAndroid className="text-lg" />
                      Android
                    </a>
                  </div>

                  <div className="flex-1">
                    <a
                      href="https://apps.apple.com/be/app/netherlink/id6747323142?l=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-gray-700 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white shadow-lg focus:outline-none w-full transition gaming-button border border-gray-600"
                    >
                      <SiApple className="text-lg" />
                      iOS
                    </a>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-emerald-500/30 -mb-2 -mr-2 z-0"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-blue-500/30 -mt-2 -ml-2 z-0"></div>
            </section>

            <section id="features" className="py-10">
  <h3 className="text-2xl font-bold text-center mb-8 text-emerald-400 gaming-title">
    Features
  </h3>
  <div className="grid gap-6 md:grid-cols-2">
    <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg shadow-lg gaming-card">
      <div className="flex items-center mb-3">
        <div className="bg-emerald-900/50 p-3 rounded-lg border border-emerald-600/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
        </div>
        <h4 className="text-lg text-emerald-400 font-medium ml-3 line-clamp-1">
          Direct UDP Tunneling
        </h4>
      </div>
      <p className="text-gray-300 text-sm">
        Broadcasts a virtual LAN server on your local network while seamlessly redirecting traffic to remote servers for superior latency.
      </p>
    </div>

    <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg shadow-lg gaming-card">
      <div className="flex items-center mb-3">
        <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-600/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h4 className="text-lg text-blue-400 font-medium ml-3 line-clamp-1">
          Protocol-Independent
        </h4>
      </div>
      <p className="text-gray-300 text-sm">
        Works without relying on Bedrock protocols, meaning faster connections, fewer updates needed, and better stability for your gameplay.
      </p>
    </div>

    <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg shadow-lg gaming-card">
      <div className="flex items-center mb-3">
        <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-600/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-lg text-purple-400 font-medium ml-3 line-clamp-1">
          Universal Console Support
        </h4>
      </div>
      <p className="text-gray-300 text-sm">
        Compatible with all gaming consoles and platforms that support LAN play, making cross-platform multiplayer effortless.
      </p>
    </div>

    <div className="bg-gray-800 border border-gray-700 p-5 rounded-lg shadow-lg gaming-card">
      <div className="flex items-center mb-3">
        <div className="bg-amber-900/50 p-3 rounded-lg border border-amber-600/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-lg text-amber-400 font-medium ml-3 line-clamp-1">
          Plug-and-Play Solution
        </h4>
      </div>
      <p className="text-gray-300 text-sm">
        Just run the app and connect - no technical knowledge required. Your console automatically discovers the server as if it were on your local network.
      </p>
    </div>
  </div>
</section>
          </main>

          {serverList}
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        /* Animation styles */
        .animate-fade-in-out {
          animation: fadeInOut 2.3s ease-in-out;
        }
        .animate-fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        /* Gaming-style elements */
        .gaming-card {
          position: relative;
          transition: all 0.3s ease;
        }
        .gaming-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
        }
        .gaming-button {
          position: relative;
          overflow: hidden;
        }
        .gaming-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: 0.5s;
        }
        .gaming-button:hover::after {
          left: 100%;
        }
        
        /* Minecraft-inspired pixel spinner */
        .pixel-spinner {
          width: 40px;
          height: 40px;
          position: relative;
        }
        .pixel-spinner-inner {
          width: 100%;
          height: 100%;
          background-color: #16a34a;
          animation: pixel-spinner-animation 1.5s linear infinite;
        }
        @keyframes pixel-spinner-animation {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }
        
        /* Pixelated text effect */
        .pixelated {
          text-shadow: 2px 2px 0px #003b25;
          letter-spacing: 1px;
        }
        
        /* Background cubes animation */
        .cubes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            radial-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: 0 0, 25px 25px;
          animation: scrollCubes 40s linear infinite;
          opacity: 0.5;
        }
        @keyframes scrollCubes {
          0% { background-position: 0 0, 25px 25px; }
          100% { background-position: 1000px 0, 1025px 25px; }
        }
      `}</style>
    </div>
  );
}