import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendar,
  FaBookmark,
  FaTrash,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import Loading from "./Loading";
import authApi from "../config/authApi";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/15 dark:border-white/15 dark:text-white dark:placeholder-white/35 dark:focus:border-red-500/60";

const labelClass =
  "block text-sm font-semibold text-slate-700 dark:text-white/70 mb-1.5";

const cardClass =
  "rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-[#0f141a] dark:shadow-none";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10";

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
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account? This permanently removes your profile and watchlist."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await authApi.delete("/profile");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("isAuthenticated");
      setAuthentication(false);
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      showMessage("error", error.response?.data?.message || "Could not delete account");
      setDeleting(false);
    }
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
    <div className="-mt-16 min-h-screen w-full bg-slate-50 pb-16 pt-16 dark:bg-[#0f141a]">
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

      <h1 className="section-title text-4xl text-center py-5 text-slate-900 dark:text-white mt-10">
        Profile
      </h1>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className={`${cardClass} flex flex-col sm:flex-row sm:items-center gap-5`}>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-red-600 text-3xl font-bold text-white">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
              {profile.user.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/60 truncate">
              {profile.user.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-white/50">
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

        <form onSubmit={handleProfileSubmit} className={cardClass}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Account Details
          </h3>
          <p className="text-sm text-slate-500 dark:text-white/60 mb-5">
            Update your name and email address.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Password
          </h3>
          <p className="text-sm text-slate-500 dark:text-white/60 mb-5">
            Change your account password.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
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

        <div className="rounded-xl border border-red-200 bg-slate-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:border-red-500/25 dark:bg-[#0f141a]">
          <div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <FaTrash />
              Delete Account
            </h3>
            <p className="text-sm text-slate-500 dark:text-white/60 mt-1">
              Permanently remove your profile and watchlist. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
