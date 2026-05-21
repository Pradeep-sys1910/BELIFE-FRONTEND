'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Bell, Shield, Camera, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Tab = 'profile' | 'account' | 'notifications' | 'privacy';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account & Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-[800px] mx-auto px-4 pt-8 pb-16">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar tabs */}
        <nav className="md:w-52 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === id
                    ? 'bg-forest-50 text-forest-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon className="w-4 h-4 shrink-0" strokeWidth={activeTab === id ? 2.5 : 1.8} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileTab user={user} token={token} setUser={setUser} />}
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user, token, setUser }: { user: any; token: string | null; setUser: any }) {
  const [form, setForm] = useState({ name: user.name || '', bio: user.bio || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', form);
      setUser(data, token!);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-6">Public profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-forest-400 to-forest-700 flex items-center justify-center text-white text-2xl font-bold">
            {user.name[0].toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
            <Camera className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          <button className="text-xs text-forest-600 font-medium mt-1.5 hover:underline">Change photo</button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            rows={4}
            maxLength={200}
            placeholder="Tell the community about yourself..."
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition bg-gray-50 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-3.5 py-2.5 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

function AccountTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'sending' | 'sent'>('idle');
  const [deleteInput, setDeleteInput] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (form.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.patch('/users/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDelete = async () => {
    setDeleteStep('sending');
    try {
      await api.post('/auth/request-delete');
      setDeleteStep('sent');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send deletion email. Try again.');
      setDeleteStep('confirm');
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-6">Account & Security</h2>

      <div className="mb-8 p-4 bg-forest-50 border border-forest-100 rounded-xl">
        <p className="text-sm font-medium text-forest-800 mb-1">Account status</p>
        <p className="text-xs text-forest-600">Your email is verified and your account is active.</p>
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mb-4">Change password</h3>
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
          <input type="password" required value={form.currentPassword}
            onChange={e => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
          <input type="password" required minLength={8} value={form.newPassword}
            onChange={e => setForm({ ...form, newPassword: e.target.value })}
            placeholder="Min. 8 characters"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
          <input type="password" required value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition" />
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-red-600 mb-1">Danger zone</h3>

        {deleteStep === 'idle' && (
          <>
            <p className="text-xs text-gray-500 mb-3">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button onClick={() => setDeleteStep('confirm')}
              className="text-sm font-medium text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition">
              Delete account
            </button>
          </>
        )}

        {deleteStep === 'confirm' && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-5 space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-red-700">Before you proceed, understand what this means:</p>
              {[
                'Your profile and all personal data will be permanently deleted',
                'All blog posts and articles you published will be deleted',
                'All comments, likes, messages and conversations will be removed',
                'BeLife retains a license to use any content you already published (per our Terms)',
                'Any user or the platform may continue to use your published content',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-xs text-red-800">
                  <span className="shrink-0 mt-0.5">✕</span><span>{item}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-red-700 mb-1.5">
                Type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> to confirm
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-red-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => { setDeleteStep('idle'); setDeleteInput(''); }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleRequestDelete}
                disabled={deleteInput !== 'DELETE'}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
                Send confirmation email
              </button>
            </div>
          </div>
        )}

        {deleteStep === 'sending' && (
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500 p-4">
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            Sending confirmation email...
          </div>
        )}

        {deleteStep === 'sent' && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-amber-900 mb-1">Check your inbox</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              We've sent a confirmation link to your email. Click it to permanently delete your account.
              The link expires in <strong>1 hour</strong>. If you change your mind, just ignore the email
              — your account stays active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailLikes: true,
    emailComments: true,
    emailFollowers: false,
    emailWeeklyDigest: true,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: 'emailLikes' as const, label: 'Someone likes your story', desc: 'Receive an email when someone likes your post' },
    { key: 'emailComments' as const, label: 'New comment on your story', desc: 'Receive an email when someone comments' },
    { key: 'emailFollowers' as const, label: 'New follower', desc: 'Receive an email when someone follows you' },
    { key: 'emailWeeklyDigest' as const, label: 'Weekly digest', desc: 'A curated weekly summary of top stories' },
  ];

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-6">Notification preferences</h2>
      <div className="space-y-4">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4
                ${prefs[key] ? 'bg-forest-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
      <button className="mt-6 bg-forest-700 hover:bg-forest-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
        onClick={() => toast.success('Preferences saved')}>
        Save preferences
      </button>
    </div>
  );
}

function PrivacyTab() {
  const [prefs, setPrefs] = useState({
    publicProfile: true,
    showEmail: false,
    allowMessages: true,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: 'publicProfile' as const, label: 'Public profile', desc: 'Anyone can view your profile and stories' },
    { key: 'showEmail' as const, label: 'Show email on profile', desc: 'Your email address will be visible to others' },
    { key: 'allowMessages' as const, label: 'Allow direct messages', desc: 'Let other members send you messages' },
  ];

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-6">Privacy settings</h2>
      <div className="space-y-4">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4
                ${prefs[key] ? 'bg-forest-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
      <button className="mt-6 bg-forest-700 hover:bg-forest-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
        onClick={() => toast.success('Privacy settings saved')}>
        Save settings
      </button>
    </div>
  );
}
