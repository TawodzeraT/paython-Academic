'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { User, Lock, Bell, Camera } from 'lucide-react';
import Input from '@/components/ui/Input';

type Tab = 'profile' | 'password' | 'notifications';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',       label: 'Profile',       icon: <User size={15} /> },
    { key: 'password',      label: 'Password',      icon: <Lock size={15} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account details.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-2xl flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
              : user?.name?.[0]?.toUpperCase()
            }
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center transition-colors">
            <Camera size={11} />
          </button>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs mt-1">
            {user?.isEmailVerified
              ? <span className="text-green-600">✓ Email verified</span>
              : <span className="text-amber-500">⚠ Email not verified</span>
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {activeTab === 'profile' && <ProfileForm user={user} onSaved={fetchMe} />}
        {activeTab === 'password' && <PasswordForm />}
        {activeTab === 'notifications' && <NotificationsForm />}
      </div>
    </div>
  );
}

// ─── Profile Form ─────────────────────────────────────────────────────────────
function ProfileForm({
  user,
  onSaved,
}: {
  user: ReturnType<typeof useAuthStore>['user'];
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    avatar: user?.avatar ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      await api.patch('/api/student/profile', form);
      await onSaved();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
      <Input
        id="name"
        label="Full Name"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
      />
      <Input
        id="avatar"
        label="Avatar URL"
        placeholder="https://..."
        value={form.avatar}
        onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

// ─── Password Form ────────────────────────────────────────────────────────────
function PasswordForm() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const handleSave = async () => {
    if (!form.currentPassword || !form.newPassword) {
      toast.error('All fields are required.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match.'); return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.'); return;
    }
    setSaving(true);
    try {
      await api.patch('/api/student/profile/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Failed to update password.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
      {[
        { id: 'currentPassword', label: 'Current Password' },
        { id: 'newPassword',     label: 'New Password' },
        { id: 'confirmPassword', label: 'Confirm New Password' },
      ].map(({ id, label }) => (
        <Input
          key={id}
          id={id}
          label={label}
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          value={form[id as keyof typeof form]}
          onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
        />
      ))}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={show}
            onChange={() => setShow(!show)}
            className="rounded"
          />
          Show passwords
        </label>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </div>
  );
}

// ─── Notifications Form ───────────────────────────────────────────────────────
function NotificationsForm() {
  const [prefs, setPrefs] = useState({
    emailPurchase:    true,
    emailCertificate: true,
    emailMarketing:   false,
    emailNewCourse:   true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/api/student/profile/notifications', prefs);
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: 'emailPurchase',    label: 'Purchase confirmations',     desc: 'Email when you buy a course' },
    { key: 'emailCertificate', label: 'Certificate notifications',  desc: 'Email when you earn a certificate' },
    { key: 'emailNewCourse',   label: 'New course announcements',   desc: 'Email when new courses launch' },
    { key: 'emailMarketing',   label: 'Marketing emails',           desc: 'Tips, offers and promotions' },
  ];

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
      {items.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
          <div
            onClick={() => toggle(key as keyof typeof prefs)}
            className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${
              prefs[key as keyof typeof prefs] ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              prefs[key as keyof typeof prefs] ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </div>
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
