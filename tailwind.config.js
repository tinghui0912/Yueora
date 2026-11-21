/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
		extend: {
			opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				control: 'var(--radius-control)',
				nav: 'var(--radius-nav)',
				container: 'var(--radius-container)',
				dialog: 'var(--radius-dialog)',
				menu: 'var(--radius-menu)',
				overlay: 'var(--radius-overlay)',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				gold: 'hsl(var(--gold))',
				/* ---- Surface semantic (3 Canonical Surfaces) ---- */
				surface: {
					canvas: 'hsl(var(--surface-canvas))',
					panel: 'hsl(var(--surface-panel))',
					raised: 'hsl(var(--surface-raised))',
					subrail: 'hsl(var(--surface-subrail))',
					'subrail-border': 'hsl(var(--surface-subrail-border))',
				},
				/* ---- Text hierarchy (ink) ---- */
				ink: {
					primary: 'hsl(var(--ink-primary))',
					secondary: 'hsl(var(--ink-secondary))',
					tertiary: 'hsl(var(--ink-tertiary))',
					subtle: 'hsl(var(--ink-subtle))',
				},
				/* ---- Border hierarchy (line) ---- */
				line: {
					subtle: 'hsl(var(--line-subtle))',
					strong: 'hsl(var(--line-strong))',
					subrail: 'hsl(var(--surface-subrail-border))',
				},
				/* ---- Brand ---- */
				brand: {
					DEFAULT: 'hsl(var(--brand))',
					soft: 'hsl(var(--brand-soft))',
					'soft-foreground': 'hsl(var(--brand-soft-foreground))',
					foreground: 'hsl(var(--brand-foreground))',
				},
				'nav-active': 'hsl(var(--nav-active-bg))',
				'control-hover-accent': 'hsl(var(--control-hover-accent))',
				/* ---- Neutral quiet & hover ---- */
				neutral: {
					muted: 'hsl(var(--neutral-muted))',
					hover: 'hsl(var(--neutral-hover))',
				},
				/* ---- Semantic status ---- */
				danger: {
					DEFAULT: 'hsl(var(--danger))',
					foreground: 'hsl(var(--danger-foreground))',
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))',
				},
				selection: 'hsl(var(--selection))',
				/* ---- Practice semantic ---- */
				practice: {
					current: 'hsl(var(--practice-current))',
					waiting: 'hsl(var(--practice-waiting))',
					error: 'hsl(var(--practice-error))',
				},
			},
			fontFamily: {
				heading: ['var(--font-heading)'],
				body: ['var(--font-body)'],
				display: ['var(--font-display)'],
				mono: ['var(--font-mono)']
			},
			transitionDuration: {
				fast: 'var(--motion-fast)',
				base: 'var(--motion-base)',
				slow: 'var(--motion-slow)',
			},
			boxShadow: {
				control: 'var(--shadow-control)',
				raised: 'var(--shadow-raised)',
				overlay: 'var(--shadow-overlay)',
			},
			maxWidth: {
				'page-compact': 'var(--page-width-compact)',
				'page-form': 'var(--page-width-form)',
				'page-standard': 'var(--page-width-standard)',
				'page-wide': 'var(--page-width-wide)',
			},
			height: {
				'control-xs': 'var(--control-height-xs)',
				'control-sm': 'var(--control-height-sm)',
				'control-md': 'var(--control-height-md)',
				'control-lg': 'var(--control-height-lg)',
				'control-xl': 'var(--control-height-xl)',
			},
			minHeight: {
				'control-xs': 'var(--control-height-xs)',
				'control-sm': 'var(--control-height-sm)',
				'control-md': 'var(--control-height-md)',
				'control-lg': 'var(--control-height-lg)',
				'control-xl': 'var(--control-height-xl)',
			},
			width: {
				'control-xs': 'var(--control-height-xs)',
				'control-sm': 'var(--control-height-sm)',
				'control-md': 'var(--control-height-md)',
				'control-lg': 'var(--control-height-lg)',
				'control-xl': 'var(--control-height-xl)',
			},
			minWidth: {
				'control-xs': 'var(--control-height-xs)',
				'control-sm': 'var(--control-height-sm)',
				'control-md': 'var(--control-height-md)',
				'control-lg': 'var(--control-height-lg)',
				'control-xl': 'var(--control-height-xl)',
			},
			keyframes: {
				'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
				'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
  },
  plugins: [require("tailwindcss-animate")],
}
