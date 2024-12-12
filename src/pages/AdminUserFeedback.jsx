import {
  BarChart2,
  Menu,
  TrendingUp,
  Monitor,
  Home,
  Mail,
  User,
  AlertCircleIcon,
  Star,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/common/Header";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  addDoc,
  doc,
  where,
} from "firebase/firestore";
import db from "../firebaseConfig";

const SIDEBAR_ITEMS = [
  {
    name: "Swachata",
    icon: BarChart2,
    color: "#355F2E",
    href: "/adminSwachataDashboard",
  },
  {
    name: "Post Office Access",
    icon: TrendingUp,
    color: "#3B82F6",
    href: "/adminUsersDashboard",
  },
  {
    name: "Post Offices",
    icon: Mail,
    color: "#6479E6",
    href: "/adminPostOfficeCheck",
  },
  {
    name: "Live Monitoring",
    icon: Monitor,
    color: "#FFF058",
    href: "/adminMonitoring",
  },
  {
    name: "Admin Notification",
    icon: AlertCircleIcon,
    color: "#F3B90D",
    href: "/adminNotifications",
  },
  { name: "Admin Access", icon: User, color: "#6EE7B7", href: "/adminAccess" },

  {
    name: "User Feedback",
    icon: MessageCircle,
    color: "#6EE7B7",
    href: "/adminFeedbackRequests",
  },
  { name: "Home", icon: Home, color: "#D9924C", href: "/" },
];

const AdminUserFeedback = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [queries, setQueries] = useState([]);
  const [favoriteQueries, setFavoriteQueries] = useState([]);
  const [activeTab, setActiveTab] = useState("queries");

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const q = query(collection(db, "queries"));
        const querySnapshot = await getDocs(q);
        const queriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQueries(queriesData);
      } catch (error) {
        console.error("Error fetching queries: ", error);
        Swal.fire("Error", "Failed to fetch queries", "error");
      }
    };

    const fetchFavoriteQueries = async () => {
      try {
        const q = query(collection(db, "fav_queries"));
        const querySnapshot = await getDocs(q);
        const favQueriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavoriteQueries(favQueriesData);
      } catch (error) {
        console.error("Error fetching favorite queries: ", error);
        Swal.fire("Error", "Failed to fetch favorite queries", "error");
      }
    };

    fetchQueries();
    fetchFavoriteQueries();
  }, []);

  const handleMarkAsRead = async (queryId) => {
    try {
      const queryToDelete =
        activeTab === "queries"
          ? queries.find((q) => q.id === queryId)
          : favoriteQueries.find((q) => q.id === queryId);

      await deleteDoc(
        doc(db, activeTab === "queries" ? "queries" : "fav_queries", queryId)
      );

      if (activeTab === "queries") {
        setQueries(queries.filter((q) => q.id !== queryId));
      } else {
        setFavoriteQueries(favoriteQueries.filter((q) => q.id !== queryId));
      }

      Swal.fire("Success", "Query marked as read", "success");
    } catch (error) {
      console.error("Error marking query as read: ", error);
      Swal.fire("Error", "Failed to mark query as read", "error");
    }
  };

  const handleMarkAsFavorite = async (queryId) => {
    try {
      const queryToFavorite = queries.find((q) => q.id === queryId);

      // Add to fav_queries collection
      await addDoc(collection(db, "fav_queries"), queryToFavorite);

      // Delete from queries collection
      await deleteDoc(doc(db, "queries", queryId));

      // Update local state
      setQueries(queries.filter((q) => q.id !== queryId));
      setFavoriteQueries([...favoriteQueries, queryToFavorite]);

      Swal.fire("Success", "Query marked as favorite", "success");
    } catch (error) {
      console.error("Error marking query as favorite: ", error);
      Swal.fire("Error", "Failed to mark query as favorite", "error");
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-96">
      <p className="text-2xl text-gray-300">
        {activeTab === "queries"
          ? "No new queries available"
          : "No favorite queries saved"}
      </p>
      <svg
        className="mt-4 w-24 h-24 text-indigo-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9 12H5l4-8v6h4l-4 8V12z" />
      </svg>
    </div>
  );

  const renderQueryList = (queryList, isFavorite = false) => (
    <div className="flex flex-wrap justify-center gap-4">
      {queryList.map((query) => (
        <div key={query.id} className="w-[90%] md:w-[90%] lg:w-[90%]">
          <div
            className={`${
              isFavorite ? "bg-yellow-600" : "bg-indigo-600"
            } shadow-lg rounded-lg`}
          >
            <div className="px-6 py-5">
              <div className="flex items-start">
                <svg
                  className="fill-current flex-shrink-0 mr-5"
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                >
                  <path
                    className={`${
                      isFavorite ? "text-yellow-300" : "text-indigo-300"
                    }`}
                    d="m16 14.883 14-7L14.447.106a1 1 0 0 0-.895 0L0 6.883l16 8Z"
                  />
                </svg>
                <div className="flex-grow truncate">
                  <div className="w-full sm:flex justify-between items-center mb-3">
                    <h2 className="text-2xl leading-snug font-extrabold text-gray-50 truncate mb-1 sm:mb-0">
                      {query.name}
                    </h2>
                  </div>
                  <div className="flex items-end justify-between whitespace-normal">
                    <div className="max-w-md text-indigo-100">
                      <p className="mb-2">
                        Email: {query.email}
                        <br />
                        Query: {query.query}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!isFavorite && (
                        <button
                          onClick={() => handleMarkAsFavorite(query.id)}
                          className="bg-white text-yellow-600 px-4 py-2 rounded-full hover:bg-gray-100 transition duration-150"
                        >
                          <Star size={18} className="inline mr-1" />
                          Favorite
                        </button>
                      )}
                      <button
                        onClick={() => handleMarkAsRead(query.id)}
                        className="bg-white text-green-600 px-4 py-2 rounded-full hover:bg-gray-100 transition duration-150"
                      >
                        <CheckCircle2 size={18} className="inline mr-1" />
                        Mark as Read
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>
      <motion.div
        className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
      >
        <div className="h-full bg-gray-800 bg-opacity-900 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
          >
            <Menu size={24} />
          </motion.button>

          <nav className="mt-8 flex-grow">
            {SIDEBAR_ITEMS.map((item) => (
              <Link key={item.href} to={item.href}>
                <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                  <item.icon
                    size={20}
                    style={{ color: item.color, minWidth: "20px" }}
                  />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        className="ml-4 whitespace-nowrap"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </nav>
        </div>
      </motion.div>
      <div className="flex-1 overflow-auto relative z-10">
        <Header title="Admin Queries" />

        <section className="flex flex-col justify-center antialiased bg-gray-900 text-gray-600 min-h-screen p-4">
          <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex mb-4 justify-center">
              <button
                onClick={() => setActiveTab("queries")}
                className={`px-4 py-2 mx-2 rounded-lg ${
                  activeTab === "queries"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                New Queries
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-4 py-2 mx-2 rounded-lg ${
                  activeTab === "favorites"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Favorite Queries
              </button>
            </div>

            {/* Content Rendering */}
            {activeTab === "queries"
              ? queries.length === 0
                ? renderEmptyState()
                : renderQueryList(queries)
              : favoriteQueries.length === 0
              ? renderEmptyState()
              : renderQueryList(favoriteQueries, true)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminUserFeedback;