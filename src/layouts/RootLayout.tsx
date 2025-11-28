import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import Header from '@/views/components/Header';
import LoadingScreen from '@/views/components/LoadingScreen';
import { ArrowUpIcon } from '@/views/assets/icons';
import { useAuth } from '@/controllers/AuthContext';
import { ThemeProvider } from '@/controllers/ThemeContext';

/**
 * RootLayout - Layout chính cho toàn bộ app
 * Chứa Header, loading state, và scroll-to-top button
 */
const RootLayout: React.FC = () => {
    const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    const [postLoginMessage, setPostLoginMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const { isAuthenticated, isAdmin, user } = useAuth();

    // Track if navigation is in progress
    const isNavigating = navigation.state === 'loading';

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 100;
            setIsScrollButtonVisible(scrolled);
            setIsHeaderScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    // Handle post-login message from location state
    useEffect(() => {
        const state = location.state as any;
        if (state?.error) {
            setPostLoginMessage(state.error);
            setTimeout(() => setPostLoginMessage(''), 4000);
            navigate(location.pathname, { replace: true, state: {} });
        }
        if (state?.needsAuth) {
            const message = state.needsAuth === 'admin'
                ? 'Bạn cần quyền Admin để truy cập trang này'
                : 'Bạn cần đăng nhập để truy cập trang này';
            setPostLoginMessage(message);
            setTimeout(() => setPostLoginMessage(''), 3000);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Determine if we're on ordering page to show scroll button
    const isOrderingPage = location.pathname === '/';

    return (
        <ThemeProvider>
            <div className="min-h-screen font-sans text-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 transition-colors duration-200">
                <Header isScrolled={isHeaderScrolled} />

                {/* Loading screen during navigation */}
                {isNavigating && <LoadingScreen />}

                {/* Post-login toast */}
                {postLoginMessage && (
                    <div className="fixed top-20 right-4 z-50 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-pop">
                        {postLoginMessage}
                    </div>
                )}

                {/* Main content with fade-in animation */}
                <div className={`transition-opacity duration-200 ${isNavigating ? 'opacity-50' : 'opacity-100'}`}>
                    <Outlet />
                </div>

                {/* Scroll to top button - only on ordering page */}
                {isOrderingPage && (
                    <button
                        onClick={scrollToTop}
                        className={`fixed bottom-6 right-6 z-20 p-3 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${isScrollButtonVisible
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 translate-y-4 pointer-events-none'
                            }`}
                        aria-label="Scroll to top"
                    >
                        <ArrowUpIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </ThemeProvider>
    );
};

export default RootLayout;
