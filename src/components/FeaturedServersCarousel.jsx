import { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";

const DATA_URL = "https://raw.githubusercontent.com/NetherDevMc/NetherLinkData/main/featured/featured-servers";

export default function FeaturedServersCarousel() {
  const [servers, setServers] = useState([]);
  const [active, setActive] = useState(0);
  const timer = useRef();

  useEffect(() => {
    fetch(DATA_URL)
      .then(r => r.json())
      .then(data => {
        setServers(data);
        if (data.length) {
          setActive(Math.floor(Math.random() * data.length));
        }
      })
      .catch(() => setServers([]));
  }, []);

  useEffect(() => {
    if (servers.length === 0) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setActive(a => (a === servers.length - 1 ? 0 : a + 1));
    }, 4000);
    return () => clearTimeout(timer.current);
  }, [active, servers.length]);

  const prev = () => {
    setActive(a => (a === 0 ? servers.length - 1 : a - 1));
  };
  const next = () => {
    setActive(a => (a === servers.length - 1 ? 0 : a + 1));
  };

  if (!servers.length) {
    return (
      <section className="w-full max-w-xl mx-auto mb-12">
        <div className="glass-tile border border-white/25 rounded-2xl shadow px-7 py-7 flex justify-center items-center text-blue-600 min-h-[140px] font-semibold opacity-80">
          Loading featured servers...
        </div>
      </section>
    );
  }

  const current = servers[active];

  return (
    <section className="w-full max-w-xl mx-auto mb-12 relative">
      <div className="glass-tile border border-white/25 rounded-2xl shadow px-2 py-5 flex flex-col items-center relative overflow-hidden min-h-[180px]">
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <button
            onClick={prev}
            className="bg-white/30 hover:bg-blue-100 text-blue-800 rounded-full p-2 shadow border border-white/30 transition"
            aria-label="Previous server"
          >
            <FaChevronLeft size={22} />
          </button>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            onClick={next}
            className="bg-white/30 hover:bg-blue-100 text-blue-800 rounded-full p-2 shadow border border-white/30 transition"
            aria-label="Next server"
          >
            <FaChevronRight size={22} />
          </button>
        </div>
        <div className="flex flex-col items-center text-center px-3 pt-1 pb-2 w-full">
          {current.iconUrl && (
            <img
              src={current.iconUrl}
              alt={current.name + " icon"}
              className="w-20 h-20 rounded-xl border border-white/40 shadow mb-3 bg-white/30 object-cover"
            />
          )}
          <h3 className="text-xl font-bold text-blue-900 mb-1">{current.name}</h3>
          <div className="text-blue-800 text-sm mb-1">
            {current.address}:{current.port}
          </div>
          <div className="text-blue-700 text-xs mb-3">{current.description}</div>
          <a
            href={current.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold px-3 py-1 rounded transition"
          >
            Visit website
            <FaExternalLinkAlt size={20} className="inline" />
          </a>
        </div>
        <div className="flex gap-1 justify-center mt-2">
          {servers.map((_, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                i === active ? "bg-cyan-500" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}