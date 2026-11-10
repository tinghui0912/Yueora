import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { ScoreSheetGlyph } from '@/components/brand/MusicalGlyphs';

/**
 * PublicFooter — shared marketing, product, and legal footer.
 * Editorial, calm, and warmly structured for a premium musical product.
 */
export default function PublicFooter() {
  return (
    <footer className="border-t border-line-subtle bg-surface-panel/50 pt-16 pb-12">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-8">
          {/* Brand & Manifesto Column */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <Logo variant="full" size="md" />
            </Link>
            <p className="mt-4 max-w-sm font-display italic text-base leading-relaxed text-ink-secondary">
              &ldquo;A personal musical journey. Bring the music that already matters to you. Keep it, play it, return to it, and preserve the moments you choose.&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-ink-tertiary">
              <ScoreSheetGlyph className="h-4 w-4 text-ink-primary" />
              <span>喜欢，就弹。· Play what you love.</span>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <p className="type-caption font-semibold uppercase tracking-wider text-ink-primary">
              Product
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-secondary">
              <li>
                <a href="#lifecycle" className="hover:text-ink-primary transition-colors">
                  The Musical Lifecycle
                </a>
              </li>
              <li>
                <a href="#repertoire" className="hover:text-ink-primary transition-colors">
                  Personal Repertoire
                </a>
              </li>
              <li>
                <a href="#practice" className="hover:text-ink-primary transition-colors">
                  Practice Stand
                </a>
              </li>
              <li>
                <a href="#performances" className="hover:text-ink-primary transition-colors">
                  Preserved Takes
                </a>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-ink-primary transition-colors">
                  Simple Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Philosophy Column */}
          <div>
            <p className="type-caption font-semibold uppercase tracking-wider text-ink-primary">
              Philosophy
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-secondary">
              <li>
                <a href="#philosophy" className="hover:text-ink-primary transition-colors">
                  Your Music, Not Ours
                </a>
              </li>
              <li>
                <span className="text-ink-tertiary">No Gamification or Streaks</span>
              </li>
              <li>
                <span className="text-ink-tertiary">Non-Judgmental Listening</span>
              </li>
              <li>
                <span className="text-ink-tertiary">Private by Default</span>
              </li>
              <li>
                <Link to="/about" className="hover:text-ink-primary transition-colors">
                  About Yueora
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Care Column */}
          <div>
            <p className="type-caption font-semibold uppercase tracking-wider text-ink-primary">
              Care &amp; Legal
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-secondary">
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
              <li>
                <Link to="/legal/acceptable-use" className="hover:text-ink-primary transition-colors">
                  Acceptable Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom border & baseline */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line-subtle pt-6 text-xs text-ink-tertiary sm:flex-row">
          <p>© 2026 Yueora Inc. Made for musicians who love the pieces they play.</p>
          <p className="font-display italic">Every piece has a life in Yueora.</p>
        </div>
      </div>
    </footer>
  );
}
