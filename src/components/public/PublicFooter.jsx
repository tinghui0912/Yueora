import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { ScoreSheetGlyph } from '@/components/brand/MusicalGlyphs';

/**
 * PublicFooter — shared marketing, product, and legal footer.
 * Matches UGC Footer simplicity & editorial calm:
 * - max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20
 * - prominent editorial brand block
 * - quiet, high-legibility navigation columns
 * - minimal bottom baseline with editorial sign-off
 */
export default function PublicFooter() {
  return (
    <footer className="border-t border-line-subtle/80 bg-surface-panel/40">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-16">
          {/* Brand & Editorial Manifesto Block */}
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center">
              <Logo variant="full" size="lg" />
            </Link>
            <p className="mt-5 font-display italic text-lg md:text-xl leading-relaxed text-ink-secondary">
              &ldquo;Bring the music that already matters to you. Keep it, play it, return to it, and preserve the moments you choose.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-2.5 text-xs tracking-wider uppercase text-ink-tertiary">
              <ScoreSheetGlyph className="h-4 w-4 text-ink-primary" />
              <span>喜欢，就弹。· Play what you love.</span>
            </div>
          </div>

          {/* Grouped Secondary Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 text-sm">
            {/* Product */}
            <div>
              <p className="type-eyebrow text-ink-primary mb-4">
                Product
              </p>
              <ul className="space-y-3 text-ink-secondary">
                <li>
                  <a href="/#lifecycle" className="hover:text-ink-primary transition-colors">
                    The Lifecycle
                  </a>
                </li>
                <li>
                  <a href="/#repertoire" className="hover:text-ink-primary transition-colors">
                    Repertoire
                  </a>
                </li>
                <li>
                  <a href="/#practice" className="hover:text-ink-primary transition-colors">
                    Practice Stand
                  </a>
                </li>
                <li>
                  <a href="/#performances" className="hover:text-ink-primary transition-colors">
                    Preserved Takes
                  </a>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-ink-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Philosophy */}
            <div>
              <p className="type-eyebrow text-ink-primary mb-4">
                Philosophy
              </p>
              <ul className="space-y-3 text-ink-secondary">
                <li>
                  <a href="/#philosophy" className="hover:text-ink-primary transition-colors">
                    Your Music, Not Ours
                  </a>
                </li>
                <li>
                  <span className="text-ink-tertiary">Zero Streak Shaming</span>
                </li>
                <li>
                  <span className="text-ink-tertiary">Acoustic Following</span>
                </li>
                <li>
                  <Link to="/about" className="hover:text-ink-primary transition-colors">
                    About Yueora
                  </Link>
                </li>
              </ul>
            </div>

            {/* Care & Legal */}
            <div className="col-span-2 sm:col-span-1">
              <p className="type-eyebrow text-ink-primary mb-4">
                Care &amp; Legal
              </p>
              <ul className="space-y-3 text-ink-secondary">
                <li>
                  <Link to="/help" className="hover:text-ink-primary transition-colors">
                    Help &amp; FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/legal/privacy" className="hover:text-ink-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/terms" className="hover:text-ink-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/legal/copyright" className="hover:text-ink-primary transition-colors">
                    Copyright &amp; Ownership
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Baseline */}
        <div className="mt-16 pt-8 border-t border-line-subtle/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-tertiary">
          <p>© 2026 Yueora Inc. Made for musicians who love the pieces they play.</p>
          <p className="font-display italic text-sm text-ink-secondary">Every piece has a life in Yueora.</p>
        </div>
      </div>
    </footer>
  );
}
