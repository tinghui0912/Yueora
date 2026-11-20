import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

/**
 * PublicMobileMenu — UGC Parity expanding header-owned dropdown navigation.
 * - Header-owned expanding panel
 * - Full available viewport width
 * - Warm translucent surface: bg-surface-canvas/95 backdrop-blur-xl
 * - Vertical text-lg link rows with subtle border-b
 * - Large 44px CTA below (touch target >= 44px)
 */
export default function PublicMobileMenu({ open, onClose }) {
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="md:hidden overflow-hidden bg-surface-canvas/95 backdrop-blur-xl border-t border-line-subtle/80"
        >
          <div className="px-6 py-5 flex flex-col">
            <a
              href="/#lifecycle"
              onClick={onClose}
              className="py-3.5 text-lg tracking-wide text-ink-primary border-b border-line-subtle/40 hover:text-brand transition-colors"
            >
              The Lifecycle
            </a>
            <a
              href="/#practice"
              onClick={onClose}
              className="py-3.5 text-lg tracking-wide text-ink-primary border-b border-line-subtle/40 hover:text-brand transition-colors"
            >
              Practice Stand
            </a>
            <a
              href="/#repertoire"
              onClick={onClose}
              className="py-3.5 text-lg tracking-wide text-ink-primary border-b border-line-subtle/40 hover:text-brand transition-colors"
            >
              Personal Repertoire
            </a>
            <Link
              to="/about"
              onClick={onClose}
              className="py-3.5 text-lg tracking-wide text-ink-primary border-b border-line-subtle/40 hover:text-brand transition-colors"
            >
              About Yueora
            </Link>
            <Link
              to="/pricing"
              onClick={onClose}
              className="py-3.5 text-lg tracking-wide text-ink-primary border-b border-line-subtle/40 hover:text-brand transition-colors"
            >
              Pricing &amp; Plans
            </Link>

            <div className="pt-5 mt-2 flex flex-col gap-3">
              {isAuthenticated ? (
                <Button asChild intent="primary" size="xl" className="w-full">
                  <Link to="/practice" onClick={onClose}>
                    Open Yueora
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild intent="primary" size="xl" className="w-full">
                    <Link to="/register?returnTo=%2Fadd-score" onClick={onClose}>
                      Start playing
                    </Link>
                  </Button>
                  <Button asChild intent="secondary" size="xl" className="w-full">
                    <Link to="/login" onClick={onClose}>
                      Log in
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
