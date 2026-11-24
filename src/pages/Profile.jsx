import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendar,
  FaBookmark,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import Loading from "./Loading";
import authApi from "../config/authApi";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-white/10 dark:text-white dark:placeholder-white/35 dark:focus:border-red-500/60";

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-white/70";

const cardClass =
  "rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#11151b]";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/5";

const Profile = ({ setAuthentication }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.get("/profile");
        setProfile(response.data);
        setName(response.data.user.name || "");
        setEmail(response.data.user.email || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        showMessage("error", error.response?.data?.message || "Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      showMessage("error", "Name and email are required");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await authApi.put("/profile", {
        name: name.trim(),
        email: email.trim()
      });
      setProfile((prev) => ({ ...prev, user: response.data.user }));
      localStorage.setItem("userName", response.data.user.name);
      localStorage.setItem("userEmail", response.data.user.email);
      showMessage("success", "Profile updated");
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("error", error.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage("error", "Please fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.put("/profile", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "Password changed");
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage("error", error.response?.data?.message || "Password change failed");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    setAuthentication(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  if (loading) {
    return <Loading />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-900 dark:text-white text-xl">
        Profile not found
      </div>
    );
  }

  const initial = (profile.user.name || "U").trim().charAt(0).toUpperCase();
  const memberSince = new Date(profile.user.date).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="-mt-16 min-h-screen w-full bg-[var(--app-bg)] pb-16 pt-16">
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-xl ${
              message.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {message.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
            {message.text}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-5 px-4 pt-10 sm:px-6">
        <h1 className="section-title text-4xl text-slate-900 dark:text-white">
          Profile
        </h1>

        <div className={`${cardClass} flex flex-col gap-4 sm:flex-row sm:items-center`}>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-red-600 text-2xl font-bold text-white">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">
              {profile.user.name}
            </h2>
            <p className="truncate text-sm text-slate-500 dark:text-white/60">
              {profile.user.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <FaCalendar />
                Member since {memberSince}
              </span>
              <Link
                to="/watchlist"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-red-600 dark:hover:text-red-400"
              >
                <FaBookmark />
                {profile.watchlistCount} saved {profile.watchlistCount === 1 ? "title" : "titles"}
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`${secondaryButtonClass} shrink-0`}
          >
            <FaSignOutAlt />
            Log Out
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={handleProfileSubmit} className={cardClass}>
            <h3 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
              Account Details
            </h3>

            <div className="grid gap-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className={`${primaryButtonClass} mt-5`}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <form onSubmit={handlePasswordSubmit} className={cardClass}>
            <h3 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
              Password
            </h3>

            <div className="grid gap-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Current password"
                />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className={`${secondaryButtonClass} mt-5`}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
