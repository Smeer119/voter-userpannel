import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { logout } from "../../store/userSlice";

const Account = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();


  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");

      try {
        const response = await axios.get(`${BACKEND_URL}/user/${userId}`);

        console.log(response)

        setUser(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      // Redirect to backend logout route
      dispatch(logout());
      localStorage.removeItem("isLogin");
      window.location.href = `${BACKEND_URL}/auth/logout`;
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Please log in
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 mt-14">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <img
            src={user.image}
            onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"; }}
            alt={user.fullName}
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">{user.fullName}</h1>
          <p className="text-gray-600 mb-6">{user.email}</p>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;