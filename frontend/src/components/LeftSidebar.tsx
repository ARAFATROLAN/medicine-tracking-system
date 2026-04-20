import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaCog,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaKey,
  FaEnvelope
} from 'react-icons/fa';
import api from '../Services/api';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onMessagesClick?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onToggle, onMessagesClick }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.updatePassword(passwordData);
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
      alert('Password updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const userRole = localStorage.getItem('role');
  const userName = localStorage.getItem('name');

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 shadow-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '256px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome, {userName}
            </p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-blue-500" />}
              <span className="text-gray-700 dark:text-gray-300">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Messages */}
            <div className="space-y-1">
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Communication
              </div>
              <button
                type="button"
                onClick={() => {
                  onMessagesClick?.();
                  onToggle();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaEnvelope className="text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">Messages</span>
              </button>
            </div>

            {/* Manage Accounts */}
            <div className="space-y-1">
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Account
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaKey className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Change Password</span>
              </button>
            </div>

            {/* Admin Only */}
            {userRole === 'Admin' && (
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Admin
                </div>
                <Link
                  to="/dashboard/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaCog className="text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">Admin Panel</span>
                </Link>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default LeftSidebar;