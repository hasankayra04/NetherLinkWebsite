import { useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

import { FaServer, FaEdit, FaTrash, FaPlus, FaCreditCard, FaHistory, FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ ip: "", port: "", banner: null });
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ ip: "", port: "", banner: null });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const ipInputRef = useRef(null);
  const portInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function logError(context, err) {
    if (err instanceof Error) {
      console.error(`[${context}] Error message:`, err.message);
      if (err.response) {
        console.error(`[${context}] Response status:`, err.response.status);
        console.error(`[${context}] Response data:`, err.response.data);
      }
    } else {
      console.error(`[${context}] Unknown error:`, err);
    }
  }

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await user.token;
        const res = await fetch(`https://backend.netherlink.net/api/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = new Error(errorData.error || "Failed to fetch user data");
          error.status = res.status;
          throw error;
        }

        const data = await res.json();
        setServers(data.servers || []);
        setAvailableSlots(data.slots || 0);
        
        console.log("User data received:", {
          servers: data.servers?.length || 0,
          availableSlots: data.slots,
          usedSlots: data.used_slots,
          remainingSlots: data.remaining_slots
        });
      } catch (err) {
        logError("fetchData", err);
        alert(`Error loading data: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const usedSlots = servers.length || 0;
  const remainingSlots = Math.max(0, availableSlots - usedSlots);

  useEffect(() => {
    if (!user) return;
    
    const fetchSubscriptions = async () => {
      setLoadingSubscriptions(true);
      try {
        const token = await user.token;
        const res = await fetch(`https://backend.netherlink.net/payment/subscriptions/${user.email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setActiveSubscriptions(data.activeSubscriptions || []);
        }
      } catch (err) {
        console.error("Could not fetch subscriptions:", err);
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddServer = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const ip = ipInputRef.current?.value;
    const port = portInputRef.current?.value;
    const banner = bannerInputRef.current?.files?.[0];

    if (!ip || !port || !banner) {
      alert("All fields are required.");
      setSubmitting(false);
      return;
    }

    const form = new FormData();
    form.append("ip", ip);
    form.append("port", port);
    form.append("banner", banner);

    try {
      const token = await user.token;
      const res = await fetch(`https://backend.netherlink.net/api/users/${user.id}/servers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const result = await res.json();

      if (!res.ok) {
        const error = new Error(result.error || "Could not add server");
        error.status = res.status;
        throw error;
      }

      setServers(result.servers);
      setFormData({ ip: "", port: "", banner: null });
      setShowModal(false);
    } catch (err) {
      logError("handleAddServer", err);
      alert("Error adding server: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this server?")) return;

    try {
      const token = await user.token;
      const res = await fetch(`https://backend.netherlink.net/api/users/${user.id}/servers/${index}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (!res.ok) {
        const error = new Error(result.error || "Could not delete server");
        error.status = res.status;
        throw error;
      }

      setServers(result.servers);
    } catch (err) {
      logError("handleDelete", err);
      alert("Error deleting server: " + (err.message || "Unknown error"));
    }
  };

  const startEdit = (index) => {
    const server = servers[index];
    setEditIndex(index);
    setEditData({ ip: server.ip, port: server.port, banner: null });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);

    const { ip, port, banner } = editData;
    if (!ip || !port) {
      alert("IP and Port are required.");
      setEditSubmitting(false);
      return;
    }

    const form = new FormData();
    form.append("ip", ip);
    form.append("port", port);
    if (banner) form.append("banner", banner);

    try {
      const token = await user.token;
      const res = await fetch(`https://backend.netherlink.net/api/users/${user.id}/servers/${editIndex}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const result = await res.json();

      if (!res.ok) {
        const error = new Error(result.error || "Edit server failed");
        error.status = res.status;
        throw error;
      }

      setServers(result.servers);
      setEditIndex(null);
      setEditData({ ip: "", port: "", banner: null });
    } catch (err) {
      logError("handleEditSubmit", err);
      alert("Error editing server: " + (err.message || "Unknown error"));
    } finally {
      setEditSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditData({ ip: "", port: "", banner: null });
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription? This will take effect at the end of your billing period.")) return;
    
    try {
      const token = await user.token;
      const res = await fetch(`https://backend.netherlink.net/payment/cancel-subscription/${user.email}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription_id: subscriptionId })
      });

      const result = await res.json();

      if (!res.ok) {
        const error = new Error(result.error || "Could not cancel subscription");
        error.status = res.status;
        throw error;
      }

      const updatedSubscriptions = activeSubscriptions.map(sub => 
        sub.subscription_id === subscriptionId 
          ? { ...sub, cancelling: true } 
          : sub
      );
      setActiveSubscriptions(updatedSubscriptions);

      alert("Subscription successfully canceled. Your access will continue until the end of the billing period.");
    } catch (err) {
      logError("handleCancelSubscription", err);
      alert("Error canceling subscription: " + (err.message || "Unknown error"));
    }
  };

  const handleSubscription = async (priceId) => {
    try {
      const token = await user.token;
      const response = await fetch(
        `https://backend.netherlink.net/payment/create-checkout-session/${user.email}/${priceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || "Could not create checkout session");
        error.status = response.status;
        throw error;
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      logError("handleSubscription", error);
      alert("Could not start payment: " + error.message);
    }
  };

  useEffect(() => {
    if (!showModal) {
      if (ipInputRef.current) ipInputRef.current.value = "";
      if (portInputRef.current) portInputRef.current.value = "";
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }, [showModal]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Navbar />
      
      {showModal && isMounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setShowModal(false)}
          />
          
          <div 
            className="relative z-[10000] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md p-6 m-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
              <FaServer className="mr-2" /> Add New Server
            </h3>
            
            <form onSubmit={handleAddServer} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="ip">Server IP</label>
                <input
                  id="ip"
                  type="text"
                  name="ip"
                  ref={ipInputRef}
                  placeholder="e.g. play.example.com"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  defaultValue=""
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="port">Port</label>
                <input
                  id="port"
                  type="text"
                  name="port"
                  ref={portInputRef}
                  placeholder="e.g. 25565"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  defaultValue=""
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="banner">Server Banner</label>
                <div className="bg-gray-700 border border-gray-600 border-dashed rounded-lg p-4">
                  <input
                    id="banner"
                    type="file"
                    name="banner"
                    ref={bannerInputRef}
                    accept="image/*"
                    className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended size: 1200×600px (2:1 ratio)
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" /> Add Server
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8 flex items-center">
          <FaServer className="mr-3" /> Dashboard
        </h1>
        
        <div className="flex flex-col gap-8">
          {/* Featured Server section */}
          <section>
            <div className="relative bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg overflow-hidden gaming-card">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-600"></div>
              
              <div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-3 flex items-center">
                  <FaServer className="mr-2" /> Featured Server List
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Make your server stand out! Place it in the <span className="text-emerald-400 font-semibold">featured list</span> for <span className="font-semibold">€10/month</span> per server.
                </p>
                
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-400">Available Slots</p>
                        <p className="text-2xl font-bold text-emerald-400">{availableSlots}</p>
                      </div>
                      
                      <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-400">Used Slots</p>
                        <p className="text-2xl font-bold text-blue-400">{usedSlots}</p>
                      </div>
                      
                      <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-400">Remaining Slots</p>
                        <p className="text-2xl font-bold text-purple-400">{remainingSlots}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        onClick={() => handleSubscription("price_1S1x3iAVKkE923gG5UyRlul5")}
                        className="gaming-button bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition flex items-center w-auto"
                      >
                        <FaCreditCard className="mr-2" />
                        Buy a Featured Slot
                      </button>
                      
                      <div className="mt-4">
                        <Link 
                          to="/transactions" 
                          className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center"
                        >
                          <FaHistory className="mr-1" />
                          View Transaction History
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {activeSubscriptions.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Your Active Subscriptions
                  </h4>
                  <div className="bg-gray-700/60 rounded-lg border border-gray-600 divide-y divide-gray-600">
                    {activeSubscriptions.map((subscription, index) => (
                      <div 
                        key={subscription.id}
                        className="p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm text-gray-300">
                            ID: <span className="font-mono text-xs text-gray-400">{subscription.subscription_id}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(subscription.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {subscription.cancelling ? (
                          <span className="text-orange-400 text-sm px-3 py-1 bg-orange-900/30 rounded-full">
                            Cancels at period end
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCancelSubscription(subscription.subscription_id)}
                            className="text-sm text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/30 hover:bg-red-900/50 rounded-full transition flex items-center"
                          >
                            <FaTimes className="mr-1" /> Cancel
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-emerald-500/30 -mb-2 -mr-2 z-0"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-blue-500/30 -mt-2 -ml-2 z-0"></div>
            </div>
          </section>
          
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-400">
                Your Featured Servers
              </h2>
              
              <button
                onClick={() => setShowModal(true)}
                disabled={remainingSlots <= 0}
                className={`px-4 py-2 rounded-lg transition flex items-center ${
                  remainingSlots > 0 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white gaming-button'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaPlus className="mr-2" />
                {remainingSlots > 0 ? 'Add New Server' : 'No Slots Available'}
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="pixel-spinner">
                  <div className="pixel-spinner-inner"></div>
                </div>
              </div>
            ) : servers.length === 0 ? (
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FaServer className="text-emerald-400 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Servers Added Yet</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Add your first server to showcase it in our featured servers list. Buy a slot if needed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden gaming-card"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={server.banner}
                        alt="Server banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                    </div>
                    
                    <div className="p-5">
                      {editIndex === idx ? (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">Server IP</label>
                            <input
                              type="text"
                              name="ip"
                              value={editData.ip}
                              onChange={handleEditInputChange}
                              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">Port</label>
                            <input
                              type="text"
                              name="port"
                              value={editData.port}
                              onChange={handleEditInputChange}
                              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-1">New Banner (optional)</label>
                            <div className="bg-gray-700 border border-gray-600 border-dashed rounded-lg p-3">
                              <input
                                type="file"
                                name="banner"
                                onChange={handleEditInputChange}
                                className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                                accept="image/*"
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <button
                              type="submit"
                              disabled={editSubmitting}
                              className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center justify-center"
                            >
                              {editSubmitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={editSubmitting}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-emerald-400">
                              Server Details
                            </h3>
                          </div>
                          
                          <div className="bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600 mb-4">
                            <p className="text-gray-200 font-mono">
                              {server.ip}:{server.port}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(idx)}
                              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gaming-button"
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(idx)}
                              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gaming-button"
                            >
                              <FaTrash className="mr-2" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

       <Footer />

      <style jsx>{`
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
      `}</style>
    </div>
  );
}