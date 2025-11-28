import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/controllers/AuthContext';
import { CheckIcon, XIcon, SettingsIcon } from '@/views/assets/icons';

interface LoginPageProps {
  onClose?: () => void;
  isModal?: boolean; // if true, render as modal overlay; otherwise full-block
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose, isModal = true }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const ANIM_MS = 220;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    (async () => {
      const success = await login(username, password);
      if (!success) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
        return;
      }
      try {
        const postLoginView = localStorage.getItem('postLoginView');
        if (postLoginView) {
          window.dispatchEvent(new CustomEvent('katuu:postLogin', { detail: { view: postLoginView } }));
          localStorage.removeItem('postLoginView');
        }
      } catch (e) {
        // ignore storage errors
      }
      // close modal if provided
      if (onClose) onClose();
    })();
  };

  // container classes: modal overlay or full-screen
  const wrapperClass = isModal
    ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
    : 'min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 flex items-center justify-center p-4';

  // focus trap & ESC behaviour when modal is open
  useEffect(() => {
    if (!isModal) return;
    const container = containerRef.current;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // focus the username input when modal opens
    setTimeout(() => {
      usernameRef.current?.focus();
    }, 0);

    const focusableSelectors = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!container) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        // animate close then call onClose
        setIsOpen(false);
        setTimeout(() => { if (onClose) onClose(); }, ANIM_MS);
        return;
      }
      if (e.key === 'Tab') {
        // querySelectorAll returns NodeListOf<Element> — cast to NodeListOf<HTMLElement> so TS knows these have .focus()
        const nodeList = container.querySelectorAll(focusableSelectors) as NodeListOf<HTMLElement>;
        const nodes = Array.from(nodeList).filter((n) => n.offsetParent !== null) as HTMLElement[];
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // restore focus to previously focused element
      try { previouslyFocused.current?.focus(); } catch (e) {}
    };
  }, [isModal, onClose]);

  // helper to close with animation (used by buttons)
  const closeWithAnimation = () => {
    setIsOpen(false);
    setTimeout(() => { if (onClose) onClose(); }, ANIM_MS);
  };

  return (
    <div
      className={`${wrapperClass} ${isOpen ? 'katuu-backdrop-enter' : 'katuu-backdrop-exit'}`}
      tabIndex={-1}
      onMouseDown={(e) => {
        // close when clicking on backdrop (overlay), but not when clicking inside dialog
        if (!isModal) return;
        if (e.target === e.currentTarget) {
          closeWithAnimation();
        }
      }}
    >
      <div className={isModal ? 'w-full max-w-md md:max-w-lg' : 'w-full max-w-md'}>
        {/* Card */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4 shadow-lg">
            <SettingsIcon className="w-10 h-10 text-white" />
          </div>
          <h1 id="katuu-login-title" className="text-3xl font-bold text-stone-800 mb-2">Katuu Admin</h1>
          <p className="text-stone-600">Đăng nhập để quản lý hệ thống</p>
        </div>

        <div
          ref={isModal ? containerRef : null}
          role={isModal ? 'dialog' : undefined}
          aria-modal={isModal ? true : undefined}
          aria-labelledby={isModal ? 'katuu-login-title' : undefined}
          className={`bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-auto relative ${isOpen ? 'katuu-enter' : 'katuu-exit'}`}
        >
          {isModal && (
            <button
              aria-label="Close login"
              onClick={closeWithAnimation}
              className="absolute right-3 top-3 text-stone-500 hover:text-stone-700 focus-visible:katuu-focus-visible"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Tên đăng nhập</label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus-visible:katuu-focus-visible"
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                aria-describedby={error ? 'katuu-login-error' : undefined}
                aria-invalid={!!error}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12 focus-visible:katuu-focus-visible"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  aria-describedby={`${error ? 'katuu-login-error ' : ''}katuu-password-help`}
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <p id="katuu-password-help" className="text-xs text-stone-500 mt-1">Mật khẩu tối thiểu 6 ký tự.</p>
            </div>

            {error && (
              <div id="katuu-login-error" role="alert" aria-live="assertive" className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <XIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all focus-visible:katuu-focus-visible"
              >
                Đăng nhập
              </button>
              {isModal && (
                <button
                  type="button"
                  onClick={closeWithAnimation}
                  className="px-4 py-3 bg-stone-200 text-stone-700 rounded-lg focus-visible:katuu-focus-visible"
                >
                  Hủy
                </button>
              )}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
             <div className="flex items-center space-x-2 mb-1"><CheckIcon className="w-3 h-3" /><span><strong>Admin:</strong> admin / admin123</span></div>
             <div className="flex items-center space-x-2"><CheckIcon className="w-3 h-3" /><span><strong>Staff:</strong> staff / staff123</span></div>
           </div>
          </form>

        </div>
        {!isModal && (
          <p className="text-center text-sm text-stone-500 mt-6">© 2025 Katuu Milk Tea. All rights reserved.</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
