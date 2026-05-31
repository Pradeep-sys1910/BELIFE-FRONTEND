'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';

const OPTIONS: { key: ThemeMode; icon: React.ElementType; label: string }[] = [
  { key: 'light',  icon: Sun,     label: 'Light'  },
  { key: 'dark',   icon: Moon,    label: 'Dark'   },
  { key: 'system', icon: Monitor, label: 'System' },
];

export default function ThemeToggle() {
  const { mode, setMode } = useThemeStore();

  return (
    <div
      className="flex gap-0.5 p-1 rounded-xl w-full"
      style={{ background: 'var(--bg-elevated)' }}
    >
      {OPTIONS.map(({ key, icon: Icon, label }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            onClick={() => setMode(key)}
            title={label}
            className="flex flex-1 items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={
              active
                ? {
                    background: 'var(--bg-card)',
                    color:      'var(--text)',
                    boxShadow:  '0 1px 4px rgba(0,0,0,0.25)',
                  }
                : { color: 'var(--text-faint)' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
