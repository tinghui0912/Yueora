import { scanPageAppearanceContent } from './lib/appearance-guard.mjs';
import { scanColorProvenanceContent } from './lib/color-provenance-guard.mjs';

console.log('🧪 Running Design System Guardrail Regression Tests...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertNegative(name, code, expectedMatch, filePath = 'test.jsx') {
  totalTests++;
  const issues = scanPageAppearanceContent(code, filePath);
  const found = issues.some(
    (i) =>
      !expectedMatch ||
      (i.matched && i.matched.includes(expectedMatch)) ||
      (i.message && i.message.includes(expectedMatch))
  );

  if (issues.length > 0 && found) {
    console.log(`  ✓ [FAIL as expected] ${name}`);
    passedTests++;
  } else {
    console.error(`  ❌ [UNEXPECTED PASS] ${name}`);
    console.error(`     Code: ${code.trim()}`);
    console.error(`     Expected to fail with match: ${expectedMatch}`);
    console.error(`     Actual issues: ${JSON.stringify(issues)}`);
    failedTests++;
  }
}

function assertPositive(name, code, filePath = 'test.jsx') {
  totalTests++;
  const issues = scanPageAppearanceContent(code, filePath);

  if (issues.length === 0) {
    console.log(`  ✓ [PASS as expected] ${name}`);
    passedTests++;
  } else {
    console.error(`  ❌ [UNEXPECTED FAIL] ${name}`);
    console.error(`     Code: ${code.trim()}`);
    console.error(`     Actual issues: ${JSON.stringify(issues)}`);
    failedTests++;
  }
}

function assertColorNegative(name, code, expectedMatch, filePath = 'src/test.jsx') {
  totalTests++;
  const issues = scanColorProvenanceContent(code, filePath);
  const found = issues.some(
    (i) =>
      !expectedMatch ||
      (i.matched && i.matched.includes(expectedMatch)) ||
      (i.message && i.message.includes(expectedMatch))
  );

  if (issues.length > 0 && found) {
    console.log(`  ✓ [FAIL as expected] ${name}`);
    passedTests++;
  } else {
    console.error(`  ❌ [UNEXPECTED PASS] ${name}`);
    console.error(`     Expected to fail with match: ${expectedMatch}`);
    console.error(`     Actual issues: ${JSON.stringify(issues)}`);
    failedTests++;
  }
}

function assertColorPositive(name, code, filePath = 'src/test.jsx') {
  totalTests++;
  const issues = scanColorProvenanceContent(code, filePath);

  if (issues.length === 0) {
    console.log(`  ✓ [PASS as expected] ${name}`);
    passedTests++;
  } else {
    console.error(`  ❌ [UNEXPECTED FAIL] ${name}`);
    console.error(`     Code: ${code.trim()}`);
    console.error(`     Actual issues: ${JSON.stringify(issues)}`);
    failedTests++;
  }
}

/**
 * Generates an out-of-order reverse alias chain requiring `depth` propagation passes.
 * e.g. depth = 21 generates A0 = A1; A1 = A2; ... A20 = A21; A21 = rootPrimitive;
 */
function generateReverseAliasChain(prefix, rootPrimitive, depth = 21) {
  const lines = [];
  for (let i = 0; i < depth; i++) {
    lines.push(`const ${prefix}${i} = ${prefix}${i + 1};`);
  }
  lines.push(`const ${prefix}${depth} = ${rootPrimitive};`);
  return lines.join('\n');
}

// -----------------------------------------------------------------------------
// 1. NEGATIVE FIXTURES (Must be rejected by Guardrails)
// -----------------------------------------------------------------------------
console.log('--- Negative Fixtures (Must be rejected) ---');

// 1.1 TSX page coverage
assertNegative(
  '.tsx page with generic radius, physical bg-white, and shadow-overlay',
  `export default function NewFeature() {
    return <div className="rounded-3xl bg-white shadow-overlay" />;
  }`,
  'rounded-3xl',
  'src/pages/NewFeature.tsx'
);

// 1.1b Retired Yueora colors and tokens
assertNegative(
  'Retired brand-fill token rejected in page',
  `export default function Page() {
    return <div className="bg-brand-fill text-brand-fill-foreground" />;
  }`,
  'bg-brand-fill',
  'src/pages/TestRetiredColor.jsx'
);

assertNegative(
  'Retired deep bronze hex (#98661B) rejected in page',
  `export default function Page() {
    return <div className="bg-[#98661B]" />;
  }`,
  '#98661B',
  'src/pages/TestRetiredColor.jsx'
);

assertNegative(
  'Retired primitive-gold-700 token rejected in page',
  `export default function Page() {
    return <div className="bg-primitive-gold-700" />;
  }`,
  'primitive-gold-700',
  'src/pages/TestRetiredColor.jsx'
);

assertNegative(
  'Retired brand-hover token rejected in page',
  `export default function Page() {
    return <div className="hover:bg-brand-hover" />;
  }`,
  'hover:bg-brand-hover',
  'src/pages/TestRetiredColor.jsx'
);

// 1.2 Button appearance: text color
assertNegative(
  'Button className with text-danger',
  `<Button className="text-danger">Delete</Button>`,
  'text-danger'
);

// 1.3 Button appearance: hover state
assertNegative(
  'Button className with hover:bg-danger',
  `<Button className="hover:bg-danger">Delete</Button>`,
  'hover:bg-danger'
);

// 1.4 Button appearance: responsive + hover modifier
assertNegative(
  'Button className with sm:hover:bg-danger',
  `<Button className="sm:hover:bg-danger">Delete</Button>`,
  'sm:hover:bg-danger'
);

// 1.5 Button appearance: focus-visible ring
assertNegative(
  'Button className with focus-visible:ring-danger',
  `<Button className="focus-visible:ring-danger">Action</Button>`,
  'focus-visible:ring-danger'
);

// 1.6 Button appearance: active scale
assertNegative(
  'Button className with active:scale-110',
  `<Button className="active:scale-110">Action</Button>`,
  'active:scale-110'
);

// 1.7 Button appearance: min-h height override
assertNegative(
  'Button className with min-h-20',
  `<Button className="min-h-20">Action</Button>`,
  'min-h-20'
);

// 1.8 Button appearance: leading and tracking typography overrides
assertNegative(
  'Button className with leading-10 tracking-widest',
  `<Button className="leading-10 tracking-widest">Action</Button>`,
  'leading-10'
);

// 1.9 Button cn() conditional override
assertNegative(
  'Button className with cn() conditional override',
  `<Button className={cn("w-full", active && "bg-danger")}>Action</Button>`,
  'bg-danger'
);

// 1.10 Button template literal conditional override
assertNegative(
  'Button className with template literal conditional override',
  `<Button className={\`w-full \${active ? "text-danger" : ""}\`}>Action</Button>`,
  'text-danger'
);

// 1.11 Button ternary conditional override
assertNegative(
  'Button className with ternary conditional override',
  `<Button className={active ? "bg-danger" : "w-full"}>Action</Button>`,
  'bg-danger'
);

// 1.12 Button unanalyzable dynamic className
assertNegative(
  'Button className with unanalyzable dynamic variable',
  `<Button className={buttonClass}>Action</Button>`,
  'buttonClass'
);

// 1.13 DialogContent appearance override
assertNegative(
  'DialogContent className with bg-surface-panel shadow-overlay',
  `<DialogContent className="max-w-sm bg-surface-panel shadow-overlay" />`,
  'bg-surface-panel'
);

// 1.14 DropdownMenuContent appearance override
assertNegative(
  'DropdownMenuContent className with shadow-overlay',
  `<DropdownMenuContent className="w-52 shadow-overlay" />`,
  'shadow-overlay'
);

// 1.15 IconButton appearance override
assertNegative(
  'IconButton className with text-brand hover:text-ink-primary',
  `<IconButton className="text-brand hover:text-ink-primary" />`,
  'text-brand'
);

// 1.16 Direct page shadow token
assertNegative(
  'Direct shadow-overlay on standard page div',
  `<div className="shadow-overlay" />`,
  'shadow-overlay'
);

// 1.17 ds-allow attempt to bypass appearance rules
assertNegative(
  'ds-allow comment attempting to hide appearance violation',
  `<div className="rounded-3xl bg-white">
    {/* ds-allow: marketing */}
  </div>`,
  'rounded-3xl'
);

// 1.18 Unknown appearance utility (backdrop-blur-xl)
assertNegative(
  'Button className with unknown appearance utility (backdrop-blur-xl)',
  `<Button className="backdrop-blur-xl">Action</Button>`,
  'backdrop-blur-xl'
);

// 1.19 Drop shadow on Button
assertNegative(
  'Button className with drop-shadow-xl',
  `<Button className="drop-shadow-xl">Action</Button>`,
  'drop-shadow-xl'
);

// 1.20 Animation utility on Button
assertNegative(
  'Button className with animate-pulse',
  `<Button className="animate-pulse">Action</Button>`,
  'animate-pulse'
);

// 1.21 Arbitrary selector on Button: [&>svg]:text-danger
assertNegative(
  'Button className with arbitrary selector [&>svg]:text-danger',
  `<Button className="[&>svg]:text-danger">Action</Button>`,
  '[&>svg]:text-danger'
);

// 1.22 Arbitrary selector on Button: [&_svg]:fill-danger
assertNegative(
  'Button className with arbitrary selector [&_svg]:fill-danger',
  `<Button className="[&_svg]:fill-danger">Action</Button>`,
  '[&_svg]:fill-danger'
);

// 1.23 clsx object syntax with appearance override
assertNegative(
  'Button className with clsx object syntax ({ "bg-danger": active })',
  `<Button className={clsx({ "bg-danger": active })}>Action</Button>`,
  'bg-danger'
);

// 1.24 cn object syntax with appearance override
assertNegative(
  'Button className with cn object syntax ({ "text-danger": active, "w-full": full })',
  `<Button className={cn({ "text-danger": active, "w-full": full })}>Action</Button>`,
  'text-danger'
);

// 1.25 clsx array syntax with appearance override
assertNegative(
  'Button className with clsx array syntax (["w-full", active && "bg-danger"])',
  `<Button className={clsx(["w-full", active && "bg-danger"])}>Action</Button>`,
  'bg-danger'
);

// 1.26 TypeScript 'as' type cast with appearance override
assertNegative(
  'Button className with TypeScript "as" cast ("bg-danger" as string)',
  `<Button className={"bg-danger" as string}>Action</Button>`,
  'bg-danger',
  'src/pages/Test.tsx'
);

// 1.27 Alias import evasion rejected (Button as B)
assertNegative(
  'Alias import evasion rejected (Button as B with bg-danger)',
  `import { Button as B } from "@/components/ui/button";
  export default function Page() {
    return <B className="bg-danger">Action</B>;
  }`,
  'bg-danger'
);

// 1.28 Protected primitive spread attribute rejected
assertNegative(
  'Protected primitive spread attribute rejected (Button {...props})',
  `const props = { className: "bg-danger" };
  <Button {...props}>Action</Button>`,
  '{...props}'
);

// 1.29 DialogContent dynamic unanalyzable className rejected
assertNegative(
  'DialogContent dynamic unanalyzable className rejected',
  `<DialogContent className={dialogClasses} />`,
  'dialogClasses'
);

// 1.30 DropdownMenuContent dynamic unanalyzable className rejected
assertNegative(
  'DropdownMenuContent dynamic unanalyzable className rejected',
  `<DropdownMenuContent className={menuClasses} />`,
  'menuClasses'
);

// 1.31 PopoverContent appearance override rejected
assertNegative(
  'PopoverContent appearance override rejected (bg-brand shadow-overlay)',
  `<PopoverContent className="bg-brand shadow-overlay" />`,
  'bg-brand'
);

// 1.32 PopoverContent dynamic unanalyzable className rejected
assertNegative(
  'PopoverContent dynamic unanalyzable className rejected',
  `<PopoverContent className={popoverClasses} />`,
  'popoverClasses'
);

// 1.33 Surface appearance override rejected (bg-brand border-brand)
assertNegative(
  'Surface appearance override rejected (bg-brand border-brand)',
  `<Surface tone="raised" className="bg-brand border-brand" />`,
  'bg-brand'
);

// 1.34 Surface generic radius override rejected (rounded-xl)
assertNegative(
  'Surface generic radius override rejected (rounded-xl)',
  `<Surface className="rounded-xl" />`,
  'rounded-xl'
);

// 1.35 Surface dynamic unanalyzable className rejected
assertNegative(
  'Surface dynamic unanalyzable className rejected',
  `<Surface className={surfaceClasses} />`,
  'surfaceClasses'
);

// 1.36 Surface spread attribute rejected
assertNegative(
  'Surface spread attribute rejected (Surface {...surfaceProps})',
  `const surfaceProps = { padding: "md" };
  <Surface {...surfaceProps} />`,
  '{...surfaceProps}'
);

// 1.37 Namespace Button import bypass rejected
assertNegative(
  'Namespace import Button bypass rejected (ButtonUI.Button with bg-danger)',
  `import * as ButtonUI from "@/components/ui/button";
  export default function Page() {
    return <ButtonUI.Button className="bg-danger">Action</ButtonUI.Button>;
  }`,
  'bg-danger'
);

// 1.38 Namespace Button spread rejected
assertNegative(
  'Namespace import Button spread rejected (ButtonUI.Button {...buttonProps})',
  `import * as ButtonUI from "@/components/ui/button";
  export default function Page() {
    return <ButtonUI.Button {...buttonProps} />;
  }`,
  '{...buttonProps}'
);

// 1.39 Namespace DialogContent appearance override rejected
assertNegative(
  'Namespace import DialogContent override rejected (DialogUI.DialogContent with bg-surface-panel)',
  `import * as DialogUI from "@/components/ui/dialog";
  export default function Page() {
    return <DialogUI.DialogContent className="max-w-sm bg-surface-panel" />;
  }`,
  'bg-surface-panel'
);

// 1.40 Namespace DropdownMenuContent appearance override rejected
assertNegative(
  'Namespace import DropdownMenuContent override rejected (MenuUI.DropdownMenuContent with shadow-overlay)',
  `import * as MenuUI from "@/components/ui/dropdown-menu";
  export default function Page() {
    return <MenuUI.DropdownMenuContent className="w-52 shadow-overlay" />;
  }`,
  'shadow-overlay'
);

// 1.41 Namespace PopoverContent appearance override rejected
assertNegative(
  'Namespace import PopoverContent override rejected (PopoverUI.PopoverContent with bg-brand)',
  `import * as PopoverUI from "@/components/ui/popover";
  export default function Page() {
    return <PopoverUI.PopoverContent className="w-72 bg-brand" />;
  }`,
  'bg-brand'
);

// 1.42 Namespace Surface appearance override rejected
assertNegative(
  'Namespace import Surface override rejected (SurfaceUI.Surface with bg-brand)',
  `import * as SurfaceUI from "@/components/patterns/Surface";
  export default function Page() {
    return <SurfaceUI.Surface tone="raised" className="bg-brand" />;
  }`,
  'bg-brand'
);

// 1.43 Local Button alias override rejected
assertNegative(
  'Local Button alias override rejected (const ActionButton = Button; with bg-danger)',
  `import { Button } from "@/components/ui/button";
  const ActionButton = Button;
  export default function Page() {
    return <ActionButton className="bg-danger">Action</ActionButton>;
  }`,
  'bg-danger'
);

// 1.44 Local Surface alias override rejected
assertNegative(
  'Local Surface alias override rejected (const Panel = Surface; with bg-brand)',
  `import { Surface } from "@/components/patterns/Surface";
  const Panel = Surface;
  export default function Page() {
    return <Panel className="bg-brand">Content</Panel>;
  }`,
  'bg-brand'
);

// 1.45 Local DialogContent alias override rejected
assertNegative(
  'Local DialogContent alias override rejected (const ModalBody = DialogContent; with shadow-overlay)',
  `import { DialogContent } from "@/components/ui/dialog";
  const ModalBody = DialogContent;
  export default function Page() {
    return <ModalBody className="max-w-sm shadow-overlay" />;
  }`,
  'shadow-overlay'
);

// 1.46 Surface hover motion override rejected
assertNegative(
  'Surface hover motion override rejected (hover:-translate-y-1)',
  `<Surface interactive className="hover:-translate-y-1" />`,
  'hover:-translate-y-1'
);

// 1.47 Surface transition timing override rejected
assertNegative(
  'Surface transition override rejected (transition-all)',
  `<Surface interactive className="transition-all" />`,
  'transition-all'
);

// 1.48 Surface duration timing override rejected
assertNegative(
  'Surface duration override rejected (duration-300)',
  `<Surface interactive className="duration-300" />`,
  'duration-300'
);

// 1.49 Surface state modifier hover rejected
assertNegative(
  'Surface state modifier hover rejected (hover:bg-brand)',
  `<Surface className="hover:bg-brand" />`,
  'hover:bg-brand'
);

// 1.50 Surface state modifier focus rejected
assertNegative(
  'Surface state modifier focus rejected (focus:ring-danger)',
  `<Surface className="focus:ring-danger" />`,
  'focus:ring-danger'
);

// 1.51 Surface group hover escape hatch rejected
assertNegative(
  'Surface group class rejected (group)',
  `<Surface className="group" />`,
  'group'
);

// 1.52 Surface transition and duration motion bundle rejected
assertNegative(
  'Surface transition and duration bundle rejected (transition-all duration-300)',
  `<Surface className="transition-all duration-300" />`,
  'transition-all'
);

// 1.53 Alias before namespace import for Button override rejected
assertNegative(
  'Alias before namespace import for Button override rejected (const ActionButton = ButtonUI.Button before import)',
  `const ActionButton = ButtonUI.Button;

  import * as ButtonUI from "@/components/ui/button";

  export default function Page() {
    return (
      <ActionButton className="bg-danger">
        Action
      </ActionButton>
    );
  }`,
  'bg-danger'
);

// 1.54 Alias before namespace import for Surface override rejected
assertNegative(
  'Alias before namespace import for Surface override rejected (const Panel = SurfaceUI.Surface before import)',
  `const Panel = SurfaceUI.Surface;

  import * as SurfaceUI from "@/components/patterns/Surface";

  export default function Page() {
    return (
      <Panel className="bg-brand">
        Content
      </Panel>
    );
  }`,
  'bg-brand'
);

// 1.55 Out-of-order multi-hop Button alias override rejected
assertNegative(
  'Out-of-order multi-hop Button alias override rejected (ActionButton = BaseButton before BaseButton = Button)',
  `const ActionButton = BaseButton;
  const BaseButton = Button;

  import { Button } from "@/components/ui/button";

  export default function Page() {
    return (
      <ActionButton className="bg-danger">
        Action
      </ActionButton>
    );
  }`,
  'bg-danger'
);

// 1.56 Mutable alias of protected primitive rejected
assertNegative(
  'Mutable alias of protected primitive rejected (let ActionButton = Button;)',
  `import { Button } from "@/components/ui/button";

  let ActionButton = Button;

  export default function Page() {
    return (
      <ActionButton className="w-full">
        Action
      </ActionButton>
    );
  }`,
  'Mutable alias of protected primitive'
);

// 1.57 Deep reverse Button alias chain (21+ levels) rejected on non-composition class
assertNegative(
  'Deep reverse Button alias chain (21+ levels) rejected on non-composition class (A0 with bg-danger)',
  `${generateReverseAliasChain('A', 'Button', 21)}

  import { Button } from "@/components/ui/button";

  export default function Page() {
    return (
      <A0 className="bg-danger">
        Action
      </A0>
    );
  }`,
  'bg-danger'
);

// 1.58 Deep reverse Surface alias chain (21+ levels) rejected on appearance override
assertNegative(
  'Deep reverse Surface alias chain (21+ levels) rejected on appearance override (S0 with bg-brand)',
  `${generateReverseAliasChain('S', 'Surface', 21)}

  import { Surface } from "@/components/patterns/Surface";

  export default function Page() {
    return (
      <S0 className="bg-brand">
        Content
      </S0>
    );
  }`,
  'bg-brand'
);

// -----------------------------------------------------------------------------
// 2. POSITIVE FIXTURES (Must be accepted by Guardrails)
// -----------------------------------------------------------------------------
console.log('\n--- Positive Fixtures (Must be accepted) ---');

assertPositive(
  'Button with standard layout composition (w-full)',
  `<Button className="w-full">Action</Button>`
);

assertPositive(
  'Button with flex and margin composition (flex-1 mt-4 sm:w-auto)',
  `<Button className="flex-1 mt-4 sm:w-auto">Action</Button>`
);

assertPositive(
  'Button with self-alignment composition (shrink-0 self-start sm:self-center)',
  `<Button className="shrink-0 self-start sm:self-center">Action</Button>`
);

assertPositive(
  'Button with responsive margin and width (mt-4 w-full sm:w-auto)',
  `<Button className="mt-4 w-full sm:w-auto">Action</Button>`
);

assertPositive(
  'Button with clsx object composition (w-full and mt-4)',
  `<Button className={clsx({ "w-full": full, "mt-4": spaced })}>Action</Button>`
);

assertPositive(
  'Button with TypeScript "as" cast with composition ("w-full" as string)',
  `<Button className={"w-full" as string}>Action</Button>`,
  'src/pages/Test.tsx'
);

assertPositive(
  'Alias import with valid composition (Button as B with w-full)',
  `import { Button as B } from "@/components/ui/button";
  export default function Page() {
    return <B className="w-full">Action</B>;
  }`
);

assertPositive(
  'Namespace import Button with valid composition (ButtonUI.Button with w-full)',
  `import * as ButtonUI from "@/components/ui/button";
  export default function Page() {
    return <ButtonUI.Button className="w-full">Action</ButtonUI.Button>;
  }`
);

assertPositive(
  'Local Button alias with valid composition (const ActionButton = Button; with w-full mt-4)',
  `import { Button } from "@/components/ui/button";
  const ActionButton = Button;
  export default function Page() {
    return <ActionButton className="w-full mt-4">Action</ActionButton>;
  }`
);

assertPositive(
  'DialogContent with standard sizing (max-w-sm)',
  `<DialogContent className="max-w-sm" />`
);

assertPositive(
  'DialogContent with medium sizing (max-w-md)',
  `<DialogContent className="max-w-md" />`
);

assertPositive(
  'Alias import DialogContent with standard sizing (DialogContent as ModalBody)',
  `import { DialogContent as ModalBody } from "@/components/ui/dialog";
  export default function Page() {
    return <ModalBody className="max-w-sm" />;
  }`
);

assertPositive(
  'Namespace import DialogContent with standard sizing (DialogUI.DialogContent)',
  `import * as DialogUI from "@/components/ui/dialog";
  export default function Page() {
    return <DialogUI.DialogContent className="max-w-sm" />;
  }`
);

assertPositive(
  'Local DialogContent alias with standard sizing (const ModalBody = DialogContent; with max-w-md)',
  `import { DialogContent } from "@/components/ui/dialog";
  const ModalBody = DialogContent;
  export default function Page() {
    return <ModalBody className="max-w-md" />;
  }`
);

assertPositive(
  'DropdownMenuContent with standard width (w-52)',
  `<DropdownMenuContent className="w-52" />`
);

assertPositive(
  'PopoverContent with allowed width constraint (w-72)',
  `<PopoverContent className="w-72" />`
);

assertPositive(
  'IconButton with shrink-0 composition',
  `<IconButton className="shrink-0" />`
);

assertPositive(
  'Surface with elevation="overlay" and positioning className',
  `<Surface elevation="overlay" className="absolute right-0 top-full w-56" />`
);

assertPositive(
  'Surface with tone="raised" elevation="overlay" padding="sm"',
  `<Surface tone="raised" elevation="overlay" padding="sm" className="absolute right-0 z-20 mt-1 w-56" />`
);

assertPositive(
  'Surface with grid and gap composition',
  `<Surface tone="panel" padding="md" className="grid grid-cols-2 gap-4" />`
);

assertPositive(
  'Surface with responsive grid composition (grid-cols-1 md:grid-cols-2)',
  `<Surface className="grid grid-cols-1 gap-4 md:grid-cols-2" />`
);

assertPositive(
  'Surface with responsive flex layout composition (flex-col md:flex-row)',
  `<Surface className="flex flex-col gap-4 md:flex-row" />`
);

assertPositive(
  'Surface with spacing and width constraint (mt-6 max-w-4xl)',
  `<Surface className="mt-6 max-w-4xl" />`
);

assertPositive(
  'Namespace import Surface with positioning composition (SurfaceUI.Surface with absolute right-0 w-56)',
  `import * as SurfaceUI from "@/components/patterns/Surface";
  export default function Page() {
    return <SurfaceUI.Surface className="absolute right-0 w-56" />;
  }`
);

assertPositive(
  'Alias before namespace import for Button with valid composition (ActionButton with w-full)',
  `const ActionButton = ButtonUI.Button;

  import * as ButtonUI from "@/components/ui/button";

  export default function Page() {
    return (
      <ActionButton className="w-full">
        Action
      </ActionButton>
    );
  }`
);

assertPositive(
  'Alias before namespace import for Surface with valid composition (Panel with grid grid-cols-2 gap-4)',
  `const Panel = SurfaceUI.Surface;

  import * as SurfaceUI from "@/components/patterns/Surface";

  export default function Page() {
    return (
      <Panel className="grid grid-cols-2 gap-4" />
    );
  }`
);

assertPositive(
  'Out-of-order multi-hop Button alias with valid composition (ActionButton with w-full)',
  `const ActionButton = BaseButton;
  const BaseButton = Button;

  import { Button } from "@/components/ui/button";

  export default function Page() {
    return (
      <ActionButton className="w-full">
        Action
      </ActionButton>
    );
  }`
);

assertPositive(
  'Deep reverse Button alias chain (21+ levels) accepted with valid composition (A0 with w-full)',
  `${generateReverseAliasChain('A', 'Button', 21)}

  import { Button } from "@/components/ui/button";

  export default function Page() {
    return (
      <A0 className="w-full">
        Action
      </A0>
    );
  }`
);

assertPositive(
  'Deep reverse Surface alias chain (21+ levels) accepted with valid composition (S0 with grid grid-cols-2 gap-4)',
  `${generateReverseAliasChain('S', 'Surface', 21)}

  import { Surface } from "@/components/patterns/Surface";

  export default function Page() {
    return (
      <S0 className="grid grid-cols-2 gap-4" />
    );
  }`
);

// -----------------------------------------------------------------------------
// 3. COLOR PROVENANCE FIXTURES (Negative & Positive)
// -----------------------------------------------------------------------------
console.log('\n--- Color Provenance & Reference Allowlist Fixtures ---');

// 3.1 Negative: new unknown hex in JSX
assertColorNegative(
  'new unknown hex in JSX fails CI',
  `export default function Comp() {
    return <div className="bg-[#1a2b3c]" />;
  }`,
  '#1a2b3c',
  'src/components/TestComp.jsx'
);

// 3.2 Negative: new unknown hex in .js
assertColorNegative(
  'new unknown hex in .js fails CI',
  `export const ACCENT_COLOR = '#4d5e6f';`,
  '#4d5e6f',
  'src/lib/constants.js'
);

// 3.3 Negative: SVG fill="#unknown"
assertColorNegative(
  'SVG fill="#unknown" fails CI',
  `export default function Icon() {
    return <svg><path fill="#fedcba" /></svg>;
  }`,
  '#fedcba',
  'src/components/CustomIcon.jsx'
);

// 3.4 Negative: SVG stroke="#unknown"
assertColorNegative(
  'SVG stroke="#unknown" fails CI',
  `export default function Icon() {
    return <svg><line stroke="#012345" /></svg>;
  }`,
  '#012345',
  'src/components/CustomIcon.jsx'
);

// 3.5 Negative: canvas fillStyle = '#unknown'
assertColorNegative(
  'canvas fillStyle = \'#unknown\' fails CI',
  `function render(ctx) {
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, 0, 100, 100);
  }`,
  '#654321',
  'src/lib/canvasDrawer.js'
);

// 3.6 Negative: canvas strokeStyle = '#unknown'
assertColorNegative(
  'canvas strokeStyle = \'#unknown\' fails CI',
  `function render(ctx) {
    ctx.strokeStyle = '#abcdef';
    ctx.stroke();
  }`,
  '#abcdef',
  'src/lib/canvasDrawer.js'
);

// 3.7 Negative: CSS raw unknown hex
assertColorNegative(
  'CSS raw unknown hex fails CI',
  `.custom-header {
    color: #334455;
  }`,
  '#334455',
  'src/styles/custom.css'
);

// 3.8 Negative: CSS unknown rgb/hsl
assertColorNegative(
  'CSS unknown rgb/hsl fails CI',
  `.custom-header {
    background: rgb(111, 222, 133);
  }`,
  'rgb(111, 222, 133)',
  'src/styles/custom.css'
);

// 3.9 Negative: unknown chromatic opacity recipe
assertColorNegative(
  'unknown chromatic opacity recipe fails CI',
  `export default function Page() {
    return <div className="bg-brand/17 text-brand/63 border-brand/41" />;
  }`,
  'bg-brand/17',
  'src/pages/TestOpacity.jsx'
);

// 3.10 Negative: retired Yueora color
assertColorNegative(
  'retired Yueora color (#98661B) fails CI in color provenance',
  `export default function Page() {
    return <div className="bg-[#98661B]" />;
  }`,
  '#98661B',
  'src/pages/TestOldColor.jsx'
);

// 3.11 Negative: text-fuchsia-500 rejected
assertColorNegative(
  'text-fuchsia-500 rejected',
  `export default function Comp() {
    return <span className="text-fuchsia-500">Notice</span>;
  }`,
  'text-fuchsia-500',
  'src/components/Comp.jsx'
);

// 3.12 Negative: bg-cyan-700 rejected
assertColorNegative(
  'bg-cyan-700 rejected',
  `export default function Comp() {
    return <div className="bg-cyan-700">Banner</div>;
  }`,
  'bg-cyan-700',
  'src/components/Comp.jsx'
);

// 3.13 Negative: border-lime-300 rejected
assertColorNegative(
  'border-lime-300 rejected',
  `export default function Comp() {
    return <div className="border-lime-300">Box</div>;
  }`,
  'border-lime-300',
  'src/components/Comp.jsx'
);

// 3.14 Negative: bg-black rejected outside approved provenance
assertColorNegative(
  'bg-black rejected outside approved provenance',
  `export default function Comp() {
    return <div className="bg-black">Backdrop</div>;
  }`,
  'bg-black',
  'src/components/CustomBackdrop.jsx'
);

// 3.15 Negative: text-white rejected outside approved provenance
assertColorNegative(
  'text-white rejected outside approved provenance',
  `export default function Comp() {
    return <span className="text-white">Text</span>;
  }`,
  'text-white',
  'src/components/Comp.jsx'
);

// 3.16 Negative: inline style rgb rejected
assertColorNegative(
  'inline style rgb rejected',
  `export default function Comp() {
    return <div style={{ color: 'rgb(12, 34, 56)' }}>Colored</div>;
  }`,
  'color',
  'src/components/Comp.jsx'
);

// 3.17 Negative: inline style hsl rejected
assertColorNegative(
  'inline style hsl rejected',
  `export default function Comp() {
    return <div style={{ backgroundColor: 'hsl(170 60% 40%)' }}>Background</div>;
  }`,
  'backgroundColor',
  'src/components/Comp.jsx'
);

// 3.18 Negative: inline style hex rejected
assertColorNegative(
  'inline style hex rejected',
  `export default function Comp() {
    return <div style={{ borderColor: '#ff00aa' }}>Border</div>;
  }`,
  '#ff00aa',
  'src/components/Comp.jsx'
);

// 3.19 Negative: JS const rgb rejected
assertColorNegative(
  'JS const rgb rejected',
  `export const BRAND_RGB = 'rgb(10, 20, 30)';`,
  'rgb(10, 20, 30)',
  'src/lib/colors.js'
);

// 3.20 Negative: JS const hsl rejected
assertColorNegative(
  'JS const hsl rejected',
  `export const ACCENT_HSL = 'hsl(200, 50%, 50%)';`,
  'hsl(200, 50%, 50%)',
  'src/lib/colors.js'
);

// 3.21 Negative: SVG unknown opacity-on-chromatic-role rejected
assertColorNegative(
  'SVG unknown opacity-on-chromatic-role rejected',
  `export default function Visual() {
    return <svg><rect fill="hsl(var(--brand))" opacity="0.33" /></svg>;
  }`,
  'opacity="0.33"',
  'src/components/visuals/CustomVisual.jsx'
);

// 3.22 Negative: Canvas unknown globalAlpha-on-chromatic-role rejected
assertColorNegative(
  'Canvas unknown globalAlpha-on-chromatic-role rejected',
  `function render(ctx) {
    ctx.globalAlpha = 0.77;
  }`,
  'globalAlpha',
  'src/lib/videoRenderer.js'
);

// 3.23 Negative: Numis raw hex used in wrong Yueora context rejected
assertColorNegative(
  'Numis raw hex used in wrong Yueora context rejected',
  `export const DEFAULT_COLOR = '#b87a28';`,
  '#b87a28',
  'src/components/library/CustomCard.jsx'
);

// 3.24 Positive: Numis actual named Tailwind status recipe accepted
assertColorPositive(
  'Numis actual named Tailwind status recipe accepted',
  `export default function StatusChip() {
    return <span className="border-emerald-200 bg-emerald-500/10 text-emerald-700">Active</span>;
  }`,
  'src/components/StatusChip.jsx'
);

// 3.25 Positive: GoogleIcon explicit external-brand exception passes
assertColorPositive(
  'GoogleIcon explicit external-brand exception passes',
  `export default function GoogleIcon() {
    return (
      <svg viewBox="0 0 24 24">
        <path d="..." fill="#4285F4" />
        <path d="..." fill="#34A853" />
        <path d="..." fill="#FBBC05" />
        <path d="..." fill="#EA4335" />
      </svg>
    );
  }`,
  'src/components/GoogleIcon.jsx'
);

// 3.26 Positive: Numis-proven framework helper color passes in chart.jsx
assertColorPositive(
  'Numis-proven framework helper color in chart.jsx passes',
  `const chartStyles = "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-dot[stroke='#fff']]:stroke-transparent";`,
  'src/components/ui/chart.jsx'
);

// 3.27 Positive: Numis dialog overlay bg-black/80 accepted in dialog.jsx
assertColorPositive(
  'Numis dialog overlay bg-black/80 accepted in dialog.jsx',
  `<DialogOverlay className="fixed inset-0 z-50 bg-black/80" />`,
  'src/components/ui/dialog.jsx'
);

// 3.28 Positive: semantic token usage passes without violations
assertColorPositive(
  'semantic token usage passes without violations',
  `export default function Card() {
    return (
      <div className="bg-surface-panel text-ink-primary border border-line-subtle">
        <svg><rect fill="hsl(var(--surface-panel))" stroke="hsl(var(--line-subtle))" /></svg>
      </div>
    );
  }`,
  'src/components/Card.jsx'
);

// 3.29 Positive: approved Numis opacity recipe accepted
assertColorPositive(
  'approved Numis opacity recipe accepted',
  `export default function Tag() {
    return <span className="bg-brand/10 text-brand border border-line-subtle/50">Tag</span>;
  }`,
  'src/components/Tag.jsx'
);

// 3.30 Positive: approved Numis primitive recipe accepted
assertColorPositive(
  'approved Numis primitive recipe accepted',
  `export default function Action() {
    return <button className="bg-brand text-brand-foreground shadow hover:bg-brand/90">Action</button>;
  }`,
  'src/components/Action.jsx'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================ REGRESSION TEST SUMMARY ================');
console.log(`Total fixtures: ${totalTests}`);
console.log(`Passed:         ${passedTests}`);
console.log(`Failed:         ${failedTests}`);
console.log('=========================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✅ All guardrail regression fixtures passed successfully.\n');
  process.exit(0);
}
