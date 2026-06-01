'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Bell, Shield, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Tab = 'profile' | 'account' | 'notifications' | 'privacy';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile',       label: 'Profile',              icon: User   },
  { id: 'account',       label: 'Account & Security',   icon: Lock   },
  { id: 'notifications', label: 'Notifications',        icon: Bell   },
  { id: 'privacy',       label: 'Privacy',              icon: Shield },
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
    <div className="max-w-[820px] mx-auto px-4 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage your profile, security, and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar tabs */}
        <nav className="md:w-52 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                style={activeTab === id
                  ? { background: 'var(--eco-dim)', color: 'var(--eco-bright)', border: '1px solid var(--border-eco)', fontWeight: 600 }
                  : { color: 'var(--text-muted)', border: '1px solid transparent' }
                }>
                <Icon className="w-4 h-4 shrink-0" strokeWidth={activeTab === id ? 2.5 : 1.8} />
                {label}
                {activeTab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--eco)' }} />}
              </button>
            ))}
          </div>
        </nav>

        {/* Content panel */}
        <div className="flex-1 min-w-0 rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {activeTab === 'profile'       && <ProfileTab user={user} token={token} setUser={setUser} />}
          {activeTab === 'account'       && <AccountTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'privacy'       && <PrivacyTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user, token, setUser }: { user: any; token: string | null; setUser: any }) {
  const [form, setForm]   = useState({ name: user.name || '', bio: user.bio || '' });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

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
      <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--text)' }}>Public profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg,#22C55E,#0F4C25)' }}>
          {user.name[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{user.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>Display name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            rows={4}
            maxLength={200}
            placeholder="Tell the community about yourself..."
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all resize-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-faint)' }}>{form.bio.length}/200</p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}>Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-3.5 py-2.5 rounded-xl text-sm cursor-not-allowed"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-faint)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Email cannot be changed.</p>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: 'var(--eco)', color: '#050C07' }}>
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

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div>
      <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--text)' }}>Account & Security</h2>

      <div className="mb-8 p-4 rounded-xl"
        style={{ background: 'var(--eco-dim)', border: '1px solid var(--border-eco)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--eco-bright)' }}>Account status</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your email is verified and your account is active.</p>
      </div>

      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>Change password</h3>
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
        {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field, i) => (
          <div key={field}>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}>
              {['Current password', 'New password', 'Confirm new password'][i]}
            </label>
            <input type="password" required value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              placeholder={field === 'newPassword' ? 'Min. 8 characters' : undefined}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)] transition-all"
              style={inputStyle} />
          </div>
        ))}
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: 'var(--eco)', color: '#050C07' }}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="mt-10 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold text-red-500 mb-1">Danger zone</h3>

        {deleteStep === 'idle' && (
          <>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button onClick={() => setDeleteStep('confirm')}
              className="text-sm font-medium text-red-500 px-4 py-2 rounded-xl transition"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              Delete account
            </button>
          </>
        )}

        {deleteStep === 'confirm' && (
          <div className="mt-2 rounded-xl p-5 space-y-4"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-red-500">Before you proceed, understand what this means:</p>
              {[
                'Your profile and all personal data will be permanently deleted',
                'All blog posts and articles you published will be deleted',
                'All comments, likes, messages and conversations will be removed',
                'BeLife does not own your content — once deleted, it will be removed from our platform',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-xs text-red-400">
                  <span className="shrink-0 mt-0.5">✕</span><span>{item}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-red-400 mb-1.5">
                Type <span className="font-mono px-1 rounded" style={{ background: 'rgba(239,68,68,0.1)' }}>DELETE</span> to confirm
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--text)' }}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => { setDeleteStep('idle'); setDeleteInput(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
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
          <div className="mt-2 flex items-center gap-3 text-sm p-4" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            Sending confirmation email...
          </div>
        )}

        {deleteStep === 'sent' && (
          <div className="mt-2 rounded-xl p-5"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-sm font-semibold text-amber-400 mb-1">Check your inbox</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
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

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4"
      style={{ background: on ? 'var(--eco)' : 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailLikes: true, emailComments: true, emailFollowers: false, emailWeeklyDigest: true,
  });

  const items = [
    { key: 'emailLikes'         as const, label: 'Someone likes your story',     desc: 'Receive an email when someone likes your post' },
    { key: 'emailComments'      as const, label: 'New comment on your story',     desc: 'Receive an email when someone comments' },
    { key: 'emailFollowers'     as const, label: 'New follower',                  desc: 'Receive an email when someone follows you' },
    { key: 'emailWeeklyDigest'  as const, label: 'Weekly digest',                 desc: 'A curated weekly summary of top stories' },
  ];

  return (
    <div>
      <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--text)' }}>Notification preferences</h2>
      <div className="space-y-1">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3.5"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{desc}</p>
            </div>
            <Toggle on={prefs[key]} onToggle={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} />
          </div>
        ))}
      </div>
      <button className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'var(--eco)', color: '#050C07' }}
        onClick={() => toast.success('Preferences saved')}>
        Save preferences
      </button>
    </div>
  );
}

function PrivacyTab() {
  const [prefs, setPrefs] = useState({
    publicProfile: true, showEmail: false, allowMessages: true,
  });

  const items = [
    { key: 'publicProfile'  as const, label: 'Public profile',          desc: 'Anyone can view your profile and stories' },
    { key: 'showEmail'      as const, label: 'Show email on profile',    desc: 'Your email address will be visible to others' },
    { key: 'allowMessages'  as const, label: 'Allow direct messages',    desc: 'Let other members send you messages' },
  ];

  return (
    <div>
      <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--text)' }}>Privacy settings</h2>
      <div className="space-y-1">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3.5"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{desc}</p>
            </div>
            <Toggle on={prefs[key]} onToggle={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} />
          </div>
        ))}
      </div>
      <button className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: 'var(--eco)', color: '#050C07' }}
        onClick={() => toast.success('Privacy settings saved')}>
        Save settings
      </button>
    </div>
  );
}
