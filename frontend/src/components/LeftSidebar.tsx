import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';
import {
  FaBars,
  FaTimes,
  FaCog,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaKey,
  FaEnvelope,
  FaPalette
} from 'react-icons/fa';
import api from '../Services/api';

// Theme colors available for selection
const THEME_COLORS = [
  { name: 'Blue', primary: '#2563eb', hex: '#2563eb' },
  { name: 'Green', primary: '#10b981', hex: '#10b981' },
  { name: 'Purple', primary: '#8b5cf6', hex: '#8b5cf6' },
  { name: 'Red', primary: '#ef4444', hex: '#ef4444' },
  { name: 'Orange', primary: '#f97316', hex: '#f97316' },
  { name: 'Pink', primary: '#ec4899', hex: '#ec4899' },
  { name: 'Teal', primary: '#14b8a6', hex: '#14b8a6' },
  { name: 'Indigo', primary: '#6366f1', hex: '#6366f1' },
];

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onMessagesClick?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onToggle, onMessagesClick }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [themeColor, setThemeColor] = useState('#2563eb'); // Default blue
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const notification = useContext(NotificationContext);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Load theme color preference
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor');
    if (savedColor) {
      setThemeColor(savedColor);
      applyThemeColor(savedColor);
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  // Apply theme color to CSS variables
  const applyThemeColor = (color: string) => {
    // Set primary theme color
    document.documentElement.style.setProperty('--theme-primary', color);
    document.documentElement.style.setProperty('--theme-primary-hover', color + 'cc');
    
    // Set dashboard background color (lighter version of theme)
    const bgColor = color + '15'; // 15 = ~8% opacity
    document.documentElement.style.setProperty('--theme-bg', bgColor);
    document.documentElement.style.setProperty('--theme-bg-solid', color + '08');
  };

  // Handle theme color change
  const handleThemeColorChange = (color: string) => {
    setThemeColor(color);
    localStorage.setItem('themeColor', color);
    applyThemeColor(color);
    setShowAppearanceModal(false);
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
      notification?.notify({
        type: 'success',
        message: 'Password updated successfully!',
      });
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

            {/* Appearance - Theme Color */}
            <button
              onClick={() => setShowAppearanceModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaPalette className="text-purple-500" style={{ color: themeColor }} />
              <span className="text-gray-700 dark:text-gray-300">
                Appearance
              </span>
              <span 
                className="ml-auto w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: themeColor }}
              />
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
                <label htmlFor="current-password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter current password"
                  title="Current Password"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter new password"
                  title="New Password"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Confirm new password"
                  title="Confirm New Password"
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

      {/* Appearance Modal - Theme Color Picker */}
      {showAppearanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
              Choose Theme Color
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select a color to customize your dashboard appearance. This will apply to all users.
            </p>
            
            <div className="grid grid-cols-4 gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleThemeColorChange(color.hex)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    themeColor === color.hex
                      ? 'border-gray-800 dark:border-gray-200 scale-105'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-md mb-2"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4 mt-4">
              <button
                type="button"
                onClick={() => setShowAppearanceModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
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