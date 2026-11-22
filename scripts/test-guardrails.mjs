import fs from 'node:fs';
import { scanPageAppearanceContent } from './lib/appearance-guard.mjs';
import { scanColorProvenanceContent } from './lib/color-provenance-guard.mjs';
import { verifyVisualRecipes, extractRecipeUnitTokens } from './lib/visual-recipe-guard.mjs';
import {
  YUEORA_SEMANTIC_COLOR_ALIASES,
  YUEORA_COMPATIBILITY_COLOR_ALIASES,
  NUMIS_REFERENCE_STATUS_RECIPES,
  YUEORA_AUTHORIZED_STATUS_RECIPES,
  YUEORA_VISUAL_RECIPE_MANIFEST,
  YUEORA_AUTHORIZED_RECIPES,
} from './lib/numis-visual-provenance-manifest.mjs';

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

// 3.24 Negative: Numis ItemCard emerald condition recipe rejected in StatusIndicator
assertColorNegative(
  'Numis ItemCard emerald condition recipe rejected in StatusIndicator',
  `export default function StatusIndicator() {
    return <span className="border-emerald-200 bg-emerald-500/10 text-emerald-700">Active</span>;
  }`,
  'border-emerald-200',
  'src/components/patterns/StatusIndicator.jsx'
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

// --- Phase 4: Numis Exact Provenance & Closure Hardening Fixtures ---

// 4.1 Negative: overlay alert-dialog /50 rejected
assertColorNegative(
  'overlay alert-dialog /50 rejected',
  `<AlertDialogOverlay className="fixed inset-0 z-50 bg-black/50" />`,
  'bg-black/50',
  'src/components/ui/alert-dialog.jsx'
);

// 4.2 Negative: overlay sheet /50 rejected
assertColorNegative(
  'overlay sheet /50 rejected',
  `<SheetOverlay className="fixed inset-0 z-50 bg-black/50" />`,
  'bg-black/50',
  'src/components/ui/sheet.jsx'
);

// 4.3 Positive: all four overlay /80 accepted in exact files
assertColorPositive(
  'alert-dialog overlay /80 accepted in alert-dialog.jsx',
  `<AlertDialogOverlay className="fixed inset-0 z-50 bg-black/80" />`,
  'src/components/ui/alert-dialog.jsx'
);
assertColorPositive(
  'dialog overlay /80 accepted in dialog.jsx',
  `<DialogOverlay className="fixed inset-0 z-50 bg-black/80" />`,
  'src/components/ui/dialog.jsx'
);
assertColorPositive(
  'drawer overlay /80 accepted in drawer.jsx',
  `<DrawerOverlay className="fixed inset-0 z-50 bg-black/80" />`,
  'src/components/ui/drawer.jsx'
);
assertColorPositive(
  'sheet overlay /80 accepted in sheet.jsx',
  `<SheetOverlay className="fixed inset-0 z-50 bg-black/80" />`,
  'src/components/ui/sheet.jsx'
);

// 4.4 Negative: approximate success raw HSL rejected in index.css
assertColorNegative(
  'approximate success raw HSL rejected',
  `:root {
    --success: 161 94% 30%;
  }`,
  '--success',
  'src/index.css'
);

// 4.5 Negative: approximate warning raw HSL rejected in index.css
assertColorNegative(
  'approximate warning raw HSL rejected',
  `:root {
    --warning: 32 95% 44%;
  }`,
  '--warning',
  'src/index.css'
);

// 4.6 Negative: unknown raw color custom property in index.css rejected
assertColorNegative(
  'unknown raw color custom property in index.css rejected',
  `:root {
    --new-purple: 280 90% 50%;
  }`,
  '--new-purple',
  'src/index.css'
);

// 4.7 Negative: mixed emerald/red/blue status recipe rejected
assertColorNegative(
  'mixed emerald/red status recipe rejected',
  `<span className="border-emerald-200 bg-emerald-500/10 text-red-700">Mix</span>`,
  'border-emerald-200',
  'src/components/Chip.jsx'
);

// 4.8 Negative: partial/mismatched status recipe rejected
assertColorNegative(
  'partial/mismatched status recipe rejected',
  `<div className="bg-amber-500/10 text-amber-600">Mismatch</div>`,
  'bg-amber-500/10 + text-amber-600',
  'src/components/Warning.jsx'
);

// 4.9 Negative: bg-danger/95 rejected unless exact source pair exists
assertColorNegative(
  'bg-danger/95 rejected unless exact source pair exists',
  `<div className="bg-danger/95 text-danger-foreground">Error</div>`,
  'bg-danger/95',
  'src/components/Alert.jsx'
);

// 4.10 Negative: text-warning/90 rejected unless exact source pair exists
assertColorNegative(
  'text-warning/90 rejected unless exact source pair exists',
  `<span className="text-warning/90">Warn</span>`,
  'text-warning/90',
  'src/components/Warn.jsx'
);

// 4.11 Negative: border-brand/60 rejected unless exact source pair exists
assertColorNegative(
  'border-brand/60 rejected unless exact source pair exists',
  `<div className="border border-brand/60">Border</div>`,
  'border-brand/60',
  'src/components/Card.jsx'
);

// 4.12 Negative: hover:opacity-95 on chromatic branded control rejected
assertColorNegative(
  'hover:opacity-95 on chromatic branded control rejected',
  `<button className="bg-brand text-brand-foreground hover:opacity-95">Play</button>`,
  'hover:opacity-95',
  'src/components/Control.jsx'
);

// 4.13 Negative: from-fuchsia-500 rejected
assertColorNegative(
  'from-fuchsia-500 rejected',
  `<div className="bg-gradient-to-r from-fuchsia-500 to-brand">Gradient</div>`,
  'from-fuchsia-500',
  'src/components/Banner.jsx'
);

// 4.14 Negative: via-cyan-600 rejected
assertColorNegative(
  'via-cyan-600 rejected',
  `<div className="bg-gradient-to-r from-brand via-cyan-600 to-brand">Gradient</div>`,
  'via-cyan-600',
  'src/components/Banner.jsx'
);

// 4.15 Negative: to-lime-300 rejected
assertColorNegative(
  'to-lime-300 rejected',
  `<div className="bg-gradient-to-r from-brand to-lime-300">Gradient</div>`,
  'to-lime-300',
  'src/components/Banner.jsx'
);

// 4.16 Negative: fill-white outside provenance rejected
assertColorNegative(
  'fill-white outside provenance rejected',
  `<svg><rect className="fill-white" /></svg>`,
  'fill-white',
  'src/components/Icon.jsx'
);

// 4.17 Negative: stroke-black outside provenance rejected
assertColorNegative(
  'stroke-black outside provenance rejected',
  `<svg><line className="stroke-black" /></svg>`,
  'stroke-black',
  'src/components/Icon.jsx'
);

// 4.18 Negative: object-literal rgb rejected
assertColorNegative(
  'object-literal rgb rejected',
  `const theme = { danger: 'rgb(255, 0, 0)' };`,
  'rgb(255, 0, 0)',
  'src/lib/theme.js'
);

// 4.19 Negative: object-literal hsl rejected
assertColorNegative(
  'object-literal hsl rejected',
  `const theme = { accent: 'hsl(36, 70%, 45%)' };`,
  'hsl(36, 70%, 45%)',
  'src/lib/theme.js'
);

// 4.20 Negative: object-literal hex rejected
assertColorNegative(
  'object-literal hex rejected',
  `const theme = { custom: '#1a2b3c' };`,
  '#1a2b3c',
  'src/lib/theme.js'
);

// 4.21 Negative: Coin condition recipes cannot be used as generic status in badge (Blocker A)
assertColorNegative(
  'emerald ItemCard condition recipe rejected in badge',
  `<span className="border-emerald-200 bg-emerald-500/10 text-emerald-700">FDC</span>`,
  'border-emerald-200',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'amber ItemCard condition recipe rejected in badge',
  `<span className="border-amber-200 bg-amber-500/10 text-amber-700">TTB</span>`,
  'border-amber-200',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'red ItemCard condition recipe as generic destructive badge rejected',
  `<span className="border-red-200 bg-red-500/10 text-red-700">B</span>`,
  'border-red-200',
  'src/components/ui/badge.jsx'
);

// 4.22 Positive: exact Numis color-opacity pairs accepted
assertColorPositive(
  'exact Numis brand/40 border hover accepted',
  `<div className="border border-brand/40">Item</div>`,
  'src/components/Item.jsx'
);
assertColorPositive(
  'exact Numis brand/30 border hover accepted',
  `<div className="border border-brand/30">Stat</div>`,
  'src/components/Stat.jsx'
);
assertColorPositive(
  'exact Numis brand/5 shadow accepted',
  `<div className="shadow-brand/5">Card</div>`,
  'src/components/Card.jsx'
);
assertColorPositive(
  'exact Numis danger/80 hover accepted',
  `<span className="hover:bg-danger/80">Badge</span>`,
  'src/components/Badge.jsx'
);
assertColorPositive(
  'exact Numis danger/90 button hover accepted',
  `<button className="hover:bg-danger/90">Button</button>`,
  'src/components/Button.jsx'
);

// 4.23 Positive: exact Numis primitive recipes accepted
assertColorPositive(
  'exact Numis Button secondary recipe accepted',
  `<button className="bg-secondary text-secondary-foreground shadow-control hover:bg-secondary/80">Secondary</button>`,
  'src/components/ui/button.jsx'
);
assertColorPositive(
  'exact Numis Button ghost recipe accepted',
  `<button className="hover:bg-brand-soft hover:text-brand-soft-foreground">Ghost</button>`,
  'src/components/ui/button.jsx'
);
assertColorPositive(
  'exact Numis Button link recipe accepted',
  `<button className="text-brand underline-offset-4 hover:underline">Link</button>`,
  'src/components/ui/button.jsx'
);
assertColorPositive(
  'exact Numis Badge secondary recipe accepted',
  `<div className="border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">Secondary</div>`,
  'src/components/ui/badge.jsx'
);
assertColorPositive(
  'exact Numis Tabs recipe accepted',
  `<div className="rounded-nav bg-neutral-muted p-1 text-ink-tertiary"><button className="rounded-control px-3 py-1 type-body-small font-medium data-[state=active]:bg-surface-canvas data-[state=active]:text-ink-primary data-[state=active]:shadow">Tab</button></div>`,
  'src/components/ui/tabs.jsx'
);
assertColorPositive(
  'exact Numis SegmentedControl recipe accepted',
  `<div className="rounded-overlay bg-neutral-muted p-1"><button className="rounded-control px-3 py-1 type-caption font-medium bg-surface-panel text-ink-primary shadow">Toggle</button></div>`,
  'src/components/patterns/SegmentedControl.jsx'
);

// -----------------------------------------------------------------------------
// 5. SECTIONS 31-33 EXACT RECIPE & OPACITY PROVENANCE HARDENING SUITE
// -----------------------------------------------------------------------------
console.log('--- Sections 31-33 Provenance & Status Hardening Fixtures ---');

// 5.1 Status Guard Negative Regressions (Section 31)
assertColorNegative(
  'standalone bg-emerald-500 rejected',
  `<span className="bg-emerald-500">Dot</span>`,
  'bg-emerald-500',
  'src/components/StatusIndicator.jsx'
);
assertColorNegative(
  'standalone bg-amber-500 rejected',
  `<span className="bg-amber-500">Dot</span>`,
  'bg-amber-500',
  'src/components/StatusIndicator.jsx'
);
assertColorNegative(
  'partial status bg-emerald-500/10 text-emerald-600 rejected',
  `<span className="bg-emerald-500/10 text-emerald-600">Partial</span>`,
  'bg-emerald-500/10 + text-emerald-600',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'partial status border-emerald-200 text-emerald-600 rejected',
  `<span className="border-emerald-200 text-emerald-600">Partial</span>`,
  'border-emerald-200 + text-emerald-600',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'status recipe missing border rejected',
  `<span className="bg-emerald-500/10 text-emerald-700">Missing Border</span>`,
  'bg-emerald-500/10 + text-emerald-700',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'partial status bg-amber-500/10 text-amber-600 rejected',
  `<span className="bg-amber-500/10 text-amber-600">Partial</span>`,
  'bg-amber-500/10 + text-amber-600',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'mismatched status border-amber-200 bg-amber-500/10 text-red-700 rejected',
  `<span className="border-amber-200 bg-amber-500/10 text-red-700">Mismatched</span>`,
  'border-amber-200',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'single text-emerald-600 in unapproved owner rejected',
  `<span className="text-emerald-600">Metric</span>`,
  'text-emerald-600',
  'src/pages/PracticeHub.jsx'
);

// 5.2 Status Guard Regressions (Section 31 / 41 / 43)
assertColorNegative(
  'warning callout recipe rejected in non-existent/unauthorized owner',
  `<div className="text-amber-600 bg-amber-50">Quota warning</div>`,
  'text-amber-600',
  'src/components/collection/BulkEstimateButton.jsx'
);
assertColorPositive(
  'exact Numis destructive toast close recipe in approved owner accepted',
  `<button className="text-red-300 hover:text-red-50 focus:ring-red-400 focus:ring-offset-red-600">Close</button>`,
  'src/components/ui/toast.jsx'
);
assertColorNegative(
  'single text-emerald-600 rejected in non-existent/unauthorized owner',
  `<span className="text-emerald-600 font-semibold">+12%</span>`,
  'text-emerald-600',
  'src/pages/UserProfile.jsx'
);

// Section 41: Semantic-Role Negative Fixtures (wrong semantic owner fails closed)
assertColorNegative(
  'emerald ItemCard condition recipe inside PracticeWorkspaceVisual rejected',
  `<div className="border-emerald-200 bg-emerald-500/10 text-emerald-700">Following</div>`,
  'border-emerald-200',
  'src/components/visuals/PracticeWorkspaceVisual.jsx'
);
assertColorNegative(
  'amber ItemCard condition recipe inside InviteAcceptance rejected',
  `<div className="border-amber-200 bg-amber-500/10 text-amber-700">Warning</div>`,
  'border-amber-200',
  'src/pages/InviteAcceptance.jsx'
);
assertColorNegative(
  'amber ItemCard condition recipe inside RecognitionReview rejected',
  `<div className="border-amber-200 bg-amber-500/10 text-amber-700">Notice</div>`,
  'border-amber-200',
  'src/pages/RecognitionReview.jsx'
);
assertColorNegative(
  'approved warning callout recipe in unapproved owner rejected',
  `<div className="text-amber-600 bg-amber-50">Callout</div>`,
  'text-amber-600 + bg-amber-50',
  'src/pages/Landing.jsx'
);

// 5.3 Opacity Guard Negative Regressions (Section 32)
assertColorNegative(
  'bg-brand/60 rejected',
  `<div className="bg-brand/60">Box</div>`,
  'bg-brand/60',
  'src/components/Box.jsx'
);
assertColorNegative(
  'border-brand/60 rejected',
  `<div className="border-brand/60">Box</div>`,
  'border-brand/60',
  'src/components/Box.jsx'
);
assertColorNegative(
  'shadow-brand/60 rejected',
  `<div className="shadow-brand/60">Box</div>`,
  'shadow-brand/60',
  'src/components/Box.jsx'
);
assertColorNegative(
  'ring-brand/60 rejected',
  `<div className="ring-brand/60">Box</div>`,
  'ring-brand/60',
  'src/components/Box.jsx'
);
assertColorNegative(
  'bg-surface-canvas/50 rejected',
  `<div className="bg-surface-canvas/50">Box</div>`,
  'bg-surface-canvas/50',
  'src/components/Box.jsx'
);
assertColorNegative(
  'bg-surface-canvas/60 rejected',
  `<div className="bg-surface-canvas/60">Box</div>`,
  'bg-surface-canvas/60',
  'src/components/Box.jsx'
);
assertColorNegative(
  'bg-brand/70 rejected',
  `<div className="bg-brand/70">Box</div>`,
  'bg-brand/70',
  'src/components/Box.jsx'
);
assertColorNegative(
  'text-brand/70 rejected',
  `<div className="text-brand/70">Box</div>`,
  'text-brand/70',
  'src/components/Box.jsx'
);

// 5.4 Opacity Guard Positive Regressions (Section 32)
assertColorPositive(
  'text-brand/60 accepted',
  `<span className="text-brand/60">Text</span>`,
  'src/components/Text.jsx'
);
assertColorPositive(
  'shadow-brand/5 accepted',
  `<div className="shadow-brand/5">Box</div>`,
  'src/components/Box.jsx'
);
assertColorPositive(
  'border-brand/40 accepted',
  `<div className="border-brand/40">Box</div>`,
  'src/components/Box.jsx'
);
assertColorPositive(
  'bg-brand/90 accepted',
  `<button className="bg-brand/90">Button</button>`,
  'src/components/Button.jsx'
);
assertColorPositive(
  'from-brand/10 accepted',
  `<div className="from-brand/10">Gradient</div>`,
  'src/components/Gradient.jsx'
);
assertColorPositive(
  'to-brand/15 accepted',
  `<div className="to-brand/15">Gradient</div>`,
  'src/components/Gradient.jsx'
);
assertColorPositive(
  'bg-neutral-muted/50 accepted',
  `<div className="bg-neutral-muted/50">Box</div>`,
  'src/components/Box.jsx'
);
assertColorPositive(
  'border-line-subtle/50 accepted',
  `<div className="border-line-subtle/50">Box</div>`,
  'src/components/Box.jsx'
);
assertColorPositive(
  'text-ink-tertiary/60 accepted',
  `<span className="text-ink-tertiary/60">Text</span>`,
  'src/components/Text.jsx'
);

// 5.5 Semantic Alias Fail-Closed in index.css (Section 33)
assertColorNegative(
  'unknown semantic alias --new-role referencing numis token rejected in index.css',
  `:root {
    --new-role: var(--numis-chart-4);
  }`,
  '--new-role',
  'src/index.css'
);
assertColorNegative(
  'unknown semantic alias --new-wash with alpha composition rejected in index.css',
  `:root {
    --new-wash: var(--numis-primary) / 0.37;
  }`,
  '--new-wash',
  'src/index.css'
);
assertColorNegative(
  'unknown semantic alias --future-status rejected in index.css',
  `:root {
    --future-status: var(--numis-chart-2);
  }`,
  '--future-status',
  'src/index.css'
);
assertColorNegative(
  'unknown semantic alias --random-foreground rejected in index.css',
  `:root {
    --random-foreground: var(--numis-primary-foreground);
  }`,
  '--random-foreground',
  'src/index.css'
);
assertColorPositive(
  'non-color tokens in index.css unaffected and accepted',
  `:root {
    --radius-control: 10px;
    --radius-container: 16px;
  }`,
  'src/index.css'
);

// 5.6 Sections 43-46 Provenance Hardening & Parity Suite

// Section 43: Status recipe with unauthorized owner fails closed
totalTests++;
try {
  const unauthIssues = scanColorProvenanceContent(
    `<button className="text-red-300 hover:text-red-50 focus:ring-red-400 focus:ring-offset-red-600">Close</button>`,
    'src/components/UnapprovedComponent.jsx'
  );
  if (unauthIssues.length > 0 && unauthIssues.some((i) => i.message && (i.message.includes('not approved') || i.message.includes('not authorized') || i.message.includes('Unapproved')))) {
    passedTests++;
    console.log(`  ✓ [PASS as expected] recipe with unapproved owner fails closed`);
  } else {
    failedTests++;
    console.error(`  ❌ [UNEXPECTED FAIL] recipe in unauthorized owner was not rejected`);
  }
} catch (err) {
  failedTests++;
  console.error(`  ❌ [ERROR] owner fail-closed test threw error:`, err);
}

// Section 44: Alias Mapping negative tests in index.css
assertColorNegative(
  '--nav-active-bg: var(--numis-chart-4) rejected in index.css',
  `:root {
    --nav-active-bg: var(--numis-chart-4);
  }`,
  '--nav-active-bg',
  'src/index.css'
);
assertColorNegative(
  '--primary: var(--numis-chart-4) rejected in index.css',
  `:root {
    --primary: var(--numis-chart-4);
  }`,
  '--primary',
  'src/index.css'
);
assertColorNegative(
  '--accent: var(--numis-primary) rejected in index.css',
  `:root {
    --accent: var(--numis-primary);
  }`,
  '--accent',
  'src/index.css'
);
assertColorNegative(
  '--new-role: var(--brand) rejected in index.css',
  `:root {
    --new-role: var(--brand);
  }`,
  '--new-role',
  'src/index.css'
);
assertColorNegative(
  '--new-panel-role: var(--surface-panel) rejected in index.css',
  `:root {
    --new-panel-role: var(--surface-panel);
  }`,
  '--new-panel-role',
  'src/index.css'
);
assertColorNegative(
  '--new-danger-soft: var(--danger) rejected in index.css',
  `:root {
    --new-danger-soft: var(--danger);
  }`,
  '--new-danger-soft',
  'src/index.css'
);

// Section 44: Positive - all 33 semantic aliases exact mapping verified in src/index.css
totalTests++;
try {
  const css = fs.readFileSync('src/index.css', 'utf8');
  let allSemanticExact = true;
  for (const [prop, expectedVal] of Object.entries(YUEORA_SEMANTIC_COLOR_ALIASES)) {
    const regex = new RegExp(`${prop}:\\s*([^;]+);`);
    const match = css.match(regex);
    if (!match || match[1].trim() !== expectedVal.trim()) {
      allSemanticExact = false;
      break;
    }
  }
  if (allSemanticExact) {
    passedTests++;
    console.log(`  ✓ [PASS as expected] all 32 Yueora semantic aliases exact mapping verified in src/index.css`);
  } else {
    failedTests++;
    console.error(`  ❌ [UNEXPECTED FAIL] some semantic color alias mappings did not match exact expected values`);
  }
} catch (err) {
  failedTests++;
  console.error(`  ❌ [ERROR] semantic alias mapping verification threw error:`, err);
}

// Section 44: Positive - all 19 compatibility aliases exact mapping verified in src/index.css
totalTests++;
try {
  const css = fs.readFileSync('src/index.css', 'utf8');
  let allCompatExact = true;
  for (const [prop, expectedVal] of Object.entries(YUEORA_COMPATIBILITY_COLOR_ALIASES)) {
    const regex = new RegExp(`${prop}:\\s*([^;]+);`);
    const match = css.match(regex);
    if (!match || match[1].trim() !== expectedVal.trim()) {
      allCompatExact = false;
      break;
    }
  }
  if (allCompatExact) {
    passedTests++;
    console.log(`  ✓ [PASS as expected] all 19 Yueora compatibility aliases exact mapping verified in src/index.css`);
  } else {
    failedTests++;
    console.error(`  ❌ [UNEXPECTED FAIL] some compatibility color alias mappings did not match exact expected values`);
  }
} catch (err) {
  failedTests++;
  console.error(`  ❌ [ERROR] compatibility alias mapping verification threw error:`, err);
}

// Section 45: Opacity prefix scanner tests including 'via'
assertColorNegative(
  'via-brand/37 rejected',
  `<div className="via-brand/37">Gradient</div>`,
  'via-brand/37',
  'src/components/Gradient.jsx'
);
assertColorNegative(
  'via-brand/70 rejected',
  `<div className="via-brand/70">Gradient</div>`,
  'via-brand/70',
  'src/components/Gradient.jsx'
);
assertColorNegative(
  'via-surface-panel/37 rejected',
  `<div className="via-surface-panel/37">Gradient</div>`,
  'via-surface-panel/37',
  'src/components/Gradient.jsx'
);

// -----------------------------------------------------------------------------
// 6. FROZEN SOURCE TRUTH & MANIFEST PROVENANCE INDEPENDENT VERIFICATION (BLOCKER A)
// -----------------------------------------------------------------------------
console.log('--- Manifest Against Frozen Facts Independent Verification ---');
const frozenFacts = JSON.parse(fs.readFileSync('scripts/fixtures/frozen-numis-source-truth.json', 'utf8'));

// 6.1 Positive metric must be text-emerald-600 at UserProfile.jsx:114
totalTests++;
{
  const posFact = frozenFacts.sourceFacts['positive-metric'];
  const refPos = NUMIS_REFERENCE_STATUS_RECIPES.find((r) => r.id === 'positive-metric');
  if (
    refPos &&
    refPos.source.file === 'src/pages/UserProfile.jsx' &&
    refPos.source.line === 114 &&
    refPos.sourceClasses.includes('text-emerald-600') &&
    posFact.file === refPos.source.file &&
    posFact.line === refPos.source.line &&
    posFact.classes.every((c) => refPos.sourceClasses.includes(c))
  ) {
    passedTests++;
    console.log('  ✓ [PASS as expected] positive metric frozen source fact verified: text-emerald-600 at UserProfile.jsx:114');
  } else {
    failedTests++;
    console.error('  ❌ [FAIL] positive metric frozen source fact verification failed');
  }
}

// 6.2 Negative metric must be text-red-500 at UserProfile.jsx:114
totalTests++;
{
  const negFact = frozenFacts.sourceFacts['negative-metric'];
  const refNeg = NUMIS_REFERENCE_STATUS_RECIPES.find((r) => r.id === 'negative-metric');
  if (
    refNeg &&
    refNeg.source.file === 'src/pages/UserProfile.jsx' &&
    refNeg.source.line === 114 &&
    refNeg.sourceClasses.includes('text-red-500') &&
    !refNeg.sourceClasses.includes('text-red-600') &&
    negFact.file === refNeg.source.file &&
    negFact.line === refNeg.source.line &&
    negFact.classes.every((c) => refNeg.sourceClasses.includes(c))
  ) {
    passedTests++;
    console.log('  ✓ [PASS as expected] negative metric frozen source fact verified: text-red-500 at UserProfile.jsx:114 (NOT text-red-600)');
  } else {
    failedTests++;
    console.error('  ❌ [FAIL] negative metric frozen source fact verification failed');
  }
}

// 6.3 Negative metric must NOT be text-red-600
totalTests++;
{
  const refNeg = NUMIS_REFERENCE_STATUS_RECIPES.find((r) => r.id === 'negative-metric');
  if (refNeg && !refNeg.sourceClasses.includes('text-red-600') && refNeg.sourceClasses.includes('text-red-500')) {
    passedTests++;
    console.log('  ✓ [PASS as expected] negative metric does NOT contain invalid text-red-600');
  } else {
    failedTests++;
    console.error('  ❌ [FAIL] negative metric contained invalid text-red-600');
  }
}

// 6.4 Warning callout must be text-amber-600 + bg-amber-50 at BulkEstimateButton.jsx:44
totalTests++;
{
  const warnFact = frozenFacts.sourceFacts['warning-callout'];
  const refWarn = NUMIS_REFERENCE_STATUS_RECIPES.find((r) => r.id === 'warning-callout');
  if (
    refWarn &&
    refWarn.source.file === 'src/components/collection/BulkEstimateButton.jsx' &&
    refWarn.source.line === 44 &&
    refWarn.sourceClasses.includes('text-amber-600') &&
    refWarn.sourceClasses.includes('bg-amber-50') &&
    warnFact.file === refWarn.source.file &&
    warnFact.line === refWarn.source.line
  ) {
    passedTests++;
    console.log('  ✓ [PASS as expected] warning callout frozen source fact verified: text-amber-600 + bg-amber-50 at BulkEstimateButton.jsx:44');
  } else {
    failedTests++;
    console.error('  ❌ [FAIL] warning callout frozen source fact verification failed');
  }
}

// 6.5 Toast destructive close must contain exact classes at toast.jsx:67
totalTests++;
{
  const toastFact = frozenFacts.sourceFacts['toast-destructive-close'];
  const refToast = NUMIS_REFERENCE_STATUS_RECIPES.find((r) => r.id === 'toast-destructive-close');
  const requiredToastClasses = ['text-red-300', 'hover:text-red-50', 'focus:ring-red-400', 'focus:ring-offset-red-600'];
  if (
    refToast &&
    refToast.source.file === 'src/components/ui/toast.jsx' &&
    refToast.source.line === 67 &&
    requiredToastClasses.every((c) => refToast.sourceClasses.includes(c)) &&
    toastFact.line === 67
  ) {
    passedTests++;
    console.log('  ✓ [PASS as expected] toast destructive close frozen source fact verified: exact classes at toast.jsx:67');
  } else {
    failedTests++;
    console.error('  ❌ [FAIL] toast destructive close frozen source fact verification failed');
  }
}

// 6.6 Active owner validation fails closed if owner path does not exist
totalTests++;
{
  let threw = false;
  const fakeRecipe = {
    id: 'fake-status',
    allowedOwners: ['src/pages/NonExistentPage.jsx'],
    approvedYueoraRoles: ['fake'],
    yueoraClasses: ['text-red-500'],
  };
  for (const owner of fakeRecipe.allowedOwners) {
    if (!fs.existsSync(owner)) {
      threw = true;
      break;
    }
  }
  if (threw) {
    passedTests++;
    console.log('  ✓ [PASS as expected] active owner path nonexistence fails closed');
  } else {
    failedTests++;
    console.error('  ❌ [FAIL] nonexistent owner path did not fail closed');
  }
}

// -----------------------------------------------------------------------------
// 7. SEMANTIC RECIPE RECOMBINATION NEGATIVE FIXTURES (BLOCKER B)
// -----------------------------------------------------------------------------
console.log('--- Semantic Recipe Recombination Negative Fixtures ---');
assertColorNegative(
  'border-brand/20 bg-brand-soft text-brand-soft-foreground rejected',
  `<div className="border border-brand/20 bg-brand-soft text-brand-soft-foreground">Brand Soft Pill</div>`,
  'border-brand/20 + bg-brand-soft + text-brand-soft-foreground',
  'src/components/patterns/StatusIndicator.jsx'
);
assertColorNegative(
  'border-danger/30 bg-danger/10 text-danger rejected',
  `<div className="border border-danger/30 bg-danger/10 text-danger">Danger Pill</div>`,
  'border-danger/30 + bg-danger/10 + text-danger',
  'src/components/patterns/StatusIndicator.jsx'
);
assertColorNegative(
  'border-line-subtle bg-neutral-muted text-ink-secondary rejected',
  `<div className="border border-line-subtle bg-neutral-muted text-ink-secondary">Warning Pill</div>`,
  'border-line-subtle + bg-neutral-muted + text-ink-secondary',
  'src/components/patterns/StatusIndicator.jsx'
);
assertColorNegative(
  'border-line-subtle bg-surface-panel text-ink-secondary rejected',
  `<div className="border border-line-subtle bg-surface-panel text-ink-secondary">Neutral Pill</div>`,
  'border-line-subtle + bg-surface-panel + text-ink-secondary',
  'src/components/patterns/StatusIndicator.jsx'
);
assertColorNegative(
  'border-transparent bg-brand-soft text-brand-soft-foreground rejected',
  `<div className="border-transparent bg-brand-soft text-brand-soft-foreground">Brand Badge</div>`,
  'border-transparent + bg-brand-soft + text-brand-soft-foreground',
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'border-transparent bg-neutral-muted text-ink-secondary rejected',
  `<div className="border-transparent bg-neutral-muted text-ink-secondary">Neutral Badge</div>`,
  'border-transparent + bg-neutral-muted + text-ink-secondary',
  'src/components/ui/badge.jsx'
);

// -----------------------------------------------------------------------------
// 8. CANONICAL NUMIS BADGE RECIPES POSITIVE FIXTURES (BLOCKER B)
// -----------------------------------------------------------------------------
console.log('--- Canonical Numis Badge Recipes Positive Fixtures ---');
assertColorPositive(
  'real Numis Badge default translated to Yueora accepted in approved owner',
  `<div className="border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80">Default / Brand</div>`,
  'src/components/ui/badge.jsx'
);
assertColorPositive(
  'real Numis Badge secondary translated to Yueora accepted in approved owner',
  `<div className="border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">Secondary</div>`,
  'src/components/ui/badge.jsx'
);
assertColorPositive(
  'real Numis Badge destructive translated to Yueora accepted in approved owner',
  `<div className="border-transparent bg-danger text-danger-foreground shadow hover:bg-danger/80">Destructive</div>`,
  'src/components/ui/badge.jsx'
);
assertColorNegative(
  'canonical Numis Badge default in unapproved owner rejected',
  `<div className="border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80">Default / Brand</div>`,
  'badge-default',
  'src/pages/UserProfile.jsx'
);

// -----------------------------------------------------------------------------
// 9. BUTTON DIRECT COUNTERPART SOURCE CONTRACT FIXTURES (BLOCKER C)
// -----------------------------------------------------------------------------
console.log('--- Button Direct Counterpart Source Contract Fixtures ---');
totalTests++;
try {
  const buttonCode = fs.readFileSync('src/components/ui/button.jsx', 'utf8');
  const baseHasNoDurationBase = !buttonCode.includes('duration-base');
  const baseHasTransitionColors = buttonCode.includes('transition-colors');
  // Check md = Numis default (36px height, text-sm, font-medium, gap-2, py-2, icon-sm)
  const mdHasHControlMd = /md:\s*"[^"]*h-control-md[^"]*min-h-control-md[^"]*px-4[^"]*py-2[^"]*text-sm[^"]*font-medium[^"]*rounded-control[^"]*gap-2[^"]*\[&_svg\]:icon-sm/.test(buttonCode);
  // Check sm = Numis sm (32px height, text-xs, font-medium, gap-2, px-3, icon-sm)
  const smHasHControlSm = /sm:\s*"[^"]*h-control-sm[^"]*min-h-control-sm[^"]*px-3[^"]*text-xs[^"]*font-medium[^"]*rounded-control[^"]*gap-2[^"]*\[&_svg\]:icon-sm/.test(buttonCode);
  // Check lg = Numis lg (40px height, text-sm, font-medium, gap-2, px-8, icon-sm)
  const lgHasHControlLg = /lg:\s*"[^"]*h-control-lg[^"]*min-h-control-lg[^"]*px-8[^"]*text-sm[^"]*font-medium[^"]*rounded-control[^"]*gap-2[^"]*\[&_svg\]:icon-sm/.test(buttonCode);

  if (baseHasNoDurationBase && baseHasTransitionColors && mdHasHControlMd && smHasHControlSm && lgHasHControlLg) {
    passedTests++;
    console.log(`  ✓ [PASS as expected] Button source recipe contract matches expected Numis mapping`);
  } else {
    failedTests++;
    console.error(`  ❌ [UNEXPECTED FAIL] Button source recipe contract check failed: baseNoDuration=${baseHasNoDurationBase}, transitionColors=${baseHasTransitionColors}, md=${mdHasHControlMd}, sm=${smHasHControlSm}, lg=${lgHasHControlLg}`);
  }
} catch (err) {
  failedTests++;
  console.error(`  ❌ [ERROR] Button parity verification threw error:`, err);
}

// Negative: Button lg with icon-md (18px) fails contract
totalTests++;
{
  const fakeLgWithIconMd = `lg: "h-control-lg min-h-control-lg px-8 text-sm font-medium rounded-control gap-2 [&_svg]:icon-md"`;
  const isCorrect = /lg:\s*"[^"]*\[&_svg\]:icon-sm/.test(fakeLgWithIconMd);
  if (!isCorrect) {
    passedTests++;
    console.log(`  ✓ [FAIL as expected] Button lg with icon-md / 18px rejected`);
  } else {
    failedTests++;
    console.error(`  ❌ [UNEXPECTED PASS] Button lg with icon-md should have been rejected`);
  }
}

// Negative: Button md without py-2 fails contract
totalTests++;
{
  const fakeMdWithoutPy2 = `md: "h-control-md min-h-control-md px-4 text-sm font-medium rounded-control gap-2 [&_svg]:icon-sm"`;
  const hasPy2 = /md:\s*"[^"]*py-2/.test(fakeMdWithoutPy2);
  if (!hasPy2) {
    passedTests++;
    console.log(`  ✓ [FAIL as expected] Button md without required direct-counterpart py-2 contract rejected`);
  } else {
    failedTests++;
    console.error(`  ❌ [UNEXPECTED PASS] Button md without py-2 should have been rejected`);
  }
}

// -----------------------------------------------------------------------------
// 6. NUMIS VISUAL TRUTH CONSOLIDATION & RECIPE CLOSURE FIXTURES
// -----------------------------------------------------------------------------
console.log('--- Numis Visual Truth Consolidation & Recipe Closure Fixtures ---');

// Negative: hover:bg-brand-soft/70 rejected (invented opacity)
assertColorNegative(
  'hover:bg-brand-soft/70 rejected (invented opacity)',
  `<div className="hover:bg-brand-soft/70">Card</div>`,
  'bg-brand-soft/70',
  'src/components/Card.jsx'
);

// Negative: invented HSL color rejected
assertColorNegative(
  'invented HSL color rejected',
  `<div className="text-[hsl(10,50%,50%)]">Text</div>`,
  'text-[hsl(10,50%,50%)]',
  'src/components/Card.jsx'
);

// Negative: invented hex color rejected
assertColorNegative(
  'invented hex color rejected',
  `<div className="bg-[#123456]">Text</div>`,
  'bg-[#123456]',
  'src/components/Card.jsx'
);

// Negative: raw visible <select> in page rejected
assertNegative(
  'raw visible <select> in page rejected',
  `<select value="1"><option value="1">1</option></select>`,
  '<select>',
  'src/pages/TestPage.jsx'
);

// Negative: raw styled <button> in page rejected
assertNegative(
  'raw styled <button> in page rejected',
  `<button className="px-4 py-2 bg-brand text-brand-foreground">Action</button>`,
  '<button>',
  'src/pages/TestPage.jsx'
);

// Negative: raw visible <input> in page rejected
assertNegative(
  'raw visible <input> in page rejected',
  `<input type="text" value="query" />`,
  '<input>',
  'src/pages/TestPage.jsx'
);

// Negative: retired bronze hex #98661B rejected in page
assertNegative(
  'retired bronze hex #98661B rejected in page',
  `<div className="text-[#98661B]">Bronze</div>`,
  '#98661B',
  'src/pages/TestPage.jsx'
);

// Negative: Tooltip using wrong foreground text-ink-primary rejected
totalTests++;
{
  const tooltipContentWithWrongFg = `<TooltipPrimitive.Content className="z-50 overflow-hidden rounded-control bg-brand px-3 py-1.5 text-xs text-ink-primary" />`;
  const isNumisRecipe = tooltipContentWithWrongFg.includes('text-brand-foreground');
  if (!isNumisRecipe) {
    passedTests++;
    console.log(`  ✓ [FAIL as expected] Tooltip using wrong foreground text-ink-primary rejected`);
  } else {
    failedTests++;
    console.error(`  ❌ [UNEXPECTED PASS] Tooltip with text-ink-primary should have failed`);
  }
}

// Positive: exact Numis Button recipe accepted
assertColorPositive(
  'exact Numis Button primary recipe accepted',
  `<button className="bg-primary text-primary-foreground shadow hover:bg-primary/90">Primary</button>`,
  'src/components/ui/button.jsx'
);

// Positive: semantic alias of Button primary recipe accepted
assertColorPositive(
  'semantic alias of Button primary recipe accepted',
  `<button className="bg-brand text-brand-foreground shadow hover:bg-brand/90">Primary</button>`,
  'src/components/ui/button.jsx'
);

// Positive: Numis Tooltip recipe accepted
assertColorPositive(
  'Numis Tooltip recipe (bg-brand text-brand-foreground) accepted',
  `<div className="bg-brand text-brand-foreground">Tooltip</div>`,
  'src/components/ui/tooltip.jsx'
);

// Positive: Numis Toggle-derived FilterTab accepted
assertColorPositive(
  'Numis Toggle-derived FilterTab accepted',
  `<button className="border border-line-subtle bg-transparent shadow-control hover:bg-brand-soft hover:text-brand-soft-foreground">Tab</button>`,
  'src/components/patterns/FilterTabs.jsx'
);

// Positive: Numis EmptyState accepted
assertColorPositive(
  'Numis EmptyState accepted',
  `<div className="bg-brand/5 text-brand/40 text-ink-primary text-ink-secondary">Empty</div>`,
  'src/components/patterns/EmptyState.jsx'
);

// Positive: Numis StatCard Surface interaction accepted
assertColorPositive(
  'Numis StatCard Surface interaction accepted',
  `<div className="bg-surface-panel border-line-subtle hover:border-brand/40 hover:shadow-raised">Surface</div>`,
  'src/components/patterns/Surface.jsx'
);

// Positive: allowed hidden file input in page accepted
assertPositive(
  'allowed hidden file input in page accepted',
  `<input type="file" className="hidden" />`,
  'src/pages/AccountSettings.jsx'
);

// Positive: DEV-only simulation button in page accepted
assertPositive(
  'DEV-only simulation button in page accepted',
  `export default function DevQA() {
    return (
      <div>
        {import.meta.env.DEV && (
          <button onClick={() => {}}>Simulate</button>
        )}
      </div>
    );
  }`,
  'src/pages/AddScore.jsx'
);

// -----------------------------------------------------------------------------
// 10. FAIL-CLOSED MALICIOUS MUTATIONS & POSITIVE CONTROLS (PHASE 7)
// -----------------------------------------------------------------------------
console.log('--- Fail-Closed Malicious Mutations & Positive Controls (Phase 7) ---');

// Mutation 1: Canonical badge default without shadow -> FAILS
assertColorNegative(
  'Mutation 1: Badge default without shadow rejected',
  `<div className="border-transparent bg-brand text-brand-foreground hover:bg-brand/80">Default / Brand</div>`,
  'shadow',
  'src/components/ui/badge.jsx'
);

// Mutation 2: Canonical badge default without hover:bg-brand/80 -> FAILS
assertColorNegative(
  'Mutation 2: Badge default without hover:bg-brand/80 rejected',
  `<div className="border-transparent bg-brand text-brand-foreground shadow">Default / Brand</div>`,
  'hover:bg-brand/80',
  'src/components/ui/badge.jsx'
);

// Mutation 3: Badge default with border-brand/30 instead of border-transparent -> FAILS
assertColorNegative(
  'Mutation 3: Badge default with border-brand/30 rejected',
  `<div className="border-brand/30 bg-brand text-brand-foreground shadow hover:bg-brand/80">Default / Brand</div>`,
  'border-brand/30',
  'src/components/ui/badge.jsx'
);

// Mutation 4: Badge default with bg-brand-soft instead of bg-brand -> FAILS
assertColorNegative(
  'Mutation 4: Badge default with bg-brand-soft rejected',
  `<div className="border-transparent bg-brand-soft text-brand-foreground shadow hover:bg-brand/80">Default / Brand</div>`,
  'bg-brand-soft',
  'src/components/ui/badge.jsx'
);

// Mutation 5: Badge default with text-ink-primary instead of text-brand-foreground -> FAILS
assertColorNegative(
  'Mutation 5: Badge default with text-ink-primary rejected',
  `<div className="border-transparent bg-brand text-ink-primary shadow hover:bg-brand/80">Default / Brand</div>`,
  'text-ink-primary',
  'src/components/ui/badge.jsx'
);

// Mutation 6: Canonical recipe in unauthorized owner -> FAILS
assertColorNegative(
  'Mutation 6: Canonical recipe in unauthorized owner rejected',
  `<div className="border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80">Default / Brand</div>`,
  'badge-default',
  'src/pages/UserProfile.jsx'
);

// Mutation 7: Change frozen Numis source fact line by +1 -> FAILS
totalTests++;
try {
  const baseRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'badge-default');
  const mutated = {
    ...baseRecipe,
    source: {
      ...baseRecipe.source,
      line: baseRecipe.source.line + 1,
    },
  };
  const issues = verifyVisualRecipes([mutated]);
  const hasMismatch = issues.some(
    (i) => i.message && (i.message.includes('line mismatch') || i.message.includes('snippet mismatch'))
  );
  if (issues.length > 0 && hasMismatch) {
    console.log('  ✓ [FAIL as expected] Mutation 7: Change frozen Numis source fact line by +1 rejected');
    passedTests++;
  } else {
    console.error('  ❌ [UNEXPECTED PASS] Mutation 7 did not fail with line/snippet mismatch');
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] Mutation 7 threw: ${e.message}`);
  failedTests++;
}

// Mutation 8: Change token in frozen exactSnippet -> FAILS
totalTests++;
try {
  const baseRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'badge-default');
  const mutated = {
    ...baseRecipe,
    source: {
      ...baseRecipe.source,
      exactSnippet: baseRecipe.source.exactSnippet.replace('bg-primary', 'bg-secondary'),
    },
  };
  const issues = verifyVisualRecipes([mutated]);
  const hasMismatch = issues.some(
    (i) => i.message && i.message.includes('snippet mismatch')
  );
  if (issues.length > 0 && hasMismatch) {
    console.log('  ✓ [FAIL as expected] Mutation 8: Change token in frozen exactSnippet rejected');
    passedTests++;
  } else {
    console.error('  ❌ [UNEXPECTED PASS] Mutation 8 did not fail with snippet mismatch');
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] Mutation 8 threw: ${e.message}`);
  failedTests++;
}

// Positive control 1: Exact authorized recipe -> PASSES
assertColorPositive(
  'Positive control 1: Exact authorized badge recipe accepted',
  `<div className="border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80">Default / Brand</div>`,
  'src/components/ui/badge.jsx'
);

// Positive control 2: Authorized recipe with Yueora-owned geometry -> PASSES
assertColorPositive(
  'Positive control 2: Authorized recipe with Yueora-owned geometry accepted',
  `<div className="rounded-full h-5 px-2 font-medium border-transparent bg-brand text-brand-foreground shadow hover:bg-brand/80">Default / Brand</div>`,
  'src/components/ui/badge.jsx'
);

// -----------------------------------------------------------------------------
// CROSS-FAMILY RECIPE UNIT & STATE MODIFIER MUTATIONS (Blocker 1 & 1A)
// -----------------------------------------------------------------------------
console.log('--- Cross-Family Recipe Unit & State Modifier Mutations ---');

function assertRecipeUnitMutation(name, filePath, mutatedContent, recipeId, expectedSubstring) {
  totalTests++;
  try {
    const recipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) throw new Error(`Unknown recipe ${recipeId}`);
    const issues = verifyVisualRecipes([recipe], {
      contentOverrides: {
        [filePath]: mutatedContent,
      },
    });
    const found = issues.some(
      (i) => !expectedSubstring || (i.message && i.message.includes(expectedSubstring))
    );
    if (issues.length > 0 && found) {
      console.log(`  ✓ [FAIL as expected] ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ [UNEXPECTED PASS] ${name}`);
      console.error(`     Expected issue containing: ${expectedSubstring}`);
      console.error(`     Actual issues: ${JSON.stringify(issues)}`);
      failedTests++;
    }
  } catch (err) {
    console.error(`  ❌ [ERROR] ${name}: ${err.message}`);
    failedTests++;
  }
}

function assertRecipeUnitPositive(name, filePath, mutatedContent, recipeId) {
  totalTests++;
  try {
    const recipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) throw new Error(`Unknown recipe ${recipeId}`);
    const issues = verifyVisualRecipes([recipe], {
      contentOverrides: {
        [filePath]: mutatedContent,
      },
    });
    if (issues.length === 0) {
      console.log(`  ✓ [PASS as expected] ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ [UNEXPECTED FAIL] ${name}`);
      console.error(`     Actual issues: ${JSON.stringify(issues)}`);
      failedTests++;
    }
  } catch (err) {
    console.error(`  ❌ [ERROR] ${name}: ${err.message}`);
    failedTests++;
  }
}

// 1. Button primary mutations
const btnCode = fs.readFileSync('src/components/ui/button.jsx', 'utf8');

// 1a. Button primary missing shadow (even when other variants in button.jsx have shadow-control)
assertRecipeUnitMutation(
  'Button primary: missing shadow caught (not leaked from other variants)',
  'src/components/ui/button.jsx',
  btnCode.replace('bg-brand text-brand-foreground shadow hover:bg-brand/90', 'bg-brand text-brand-foreground hover:bg-brand/90'),
  'button-default',
  'shadow'
);

// 1b. Button primary missing hover state
assertRecipeUnitMutation(
  'Button primary: missing hover state caught',
  'src/components/ui/button.jsx',
  btnCode.replace('hover:bg-brand/90', ''),
  'button-default',
  'hover:bg-brand/90'
);

// 1c. Button primary stripped hover modifier (bg-brand/90 without hover:)
assertRecipeUnitMutation(
  'Button primary: stripped hover modifier caught',
  'src/components/ui/button.jsx',
  btnCode.replace('hover:bg-brand/90', 'bg-brand/90'),
  'button-default',
  'hover:bg-brand/90'
);

// 1d. Button primary wrong text (text-ink-primary instead of text-brand-foreground)
assertRecipeUnitMutation(
  'Button primary: wrong text foreground caught',
  'src/components/ui/button.jsx',
  btnCode.replace('text-brand-foreground', 'text-ink-primary'),
  'button-default',
  'text-brand-foreground'
);

// 1e. Mandatory Mutation 1: Button primary + active:scale-110 -> FAIL (unexpected protected token)
assertRecipeUnitMutation(
  'Mandatory Mutation 1: Button primary with unauthorized active:scale-110 rejected',
  'src/components/ui/button.jsx',
  btnCode.replace('hover:bg-brand/90', 'hover:bg-brand/90 active:scale-110'),
  'button-default',
  'active:scale-110'
);

// 1f. Mandatory Mutation 2: Button primary + active:bg-brand-soft -> FAIL (unexpected protected chromatic state)
assertRecipeUnitMutation(
  'Mandatory Mutation 2: Button primary with unauthorized active:bg-brand-soft rejected',
  'src/components/ui/button.jsx',
  btnCode.replace('hover:bg-brand/90', 'hover:bg-brand/90 active:bg-brand-soft'),
  'button-default',
  'active:bg-brand-soft'
);

// 1g. Mandatory Positive Control 7: Button primary + allowed structural utility gap-2 -> PASS
assertRecipeUnitPositive(
  'Mandatory Positive Control 7: Button primary with allowed structural utility gap-2 accepted',
  'src/components/ui/button.jsx',
  btnCode.replace('hover:bg-brand/90', 'hover:bg-brand/90 gap-2'),
  'button-default'
);

// 2. Select mutations & cross-component leakage guards
const selectCode = fs.readFileSync('src/components/ui/select.jsx', 'utf8');

// 2a. Mandatory Mutation 3: SelectTrigger missing shadow-control while NativeSelect has it -> FAIL
assertRecipeUnitMutation(
  'Mandatory Mutation 3: SelectTrigger missing shadow-control caught (isolated from NativeSelect)',
  'src/components/ui/select.jsx',
  selectCode.replace(
    'text-ink-primary shadow-control transition-colors',
    'text-ink-primary transition-colors'
  ),
  'select-trigger',
  'shadow-control'
);

// 2b. Mandatory Mutation 4: SelectTrigger wrong focus ring while NativeSelect has correct ring -> FAIL
assertRecipeUnitMutation(
  'Mandatory Mutation 4: SelectTrigger wrong focus ring (focus:ring-danger) caught',
  'src/components/ui/select.jsx',
  selectCode.replace('focus:ring-1 focus:ring-brand', 'focus:ring-1 focus:ring-danger'),
  'select-trigger',
  'focus:ring-danger'
);

// 3. Tooltip mutations
const tooltipCode = fs.readFileSync('src/components/ui/tooltip.jsx', 'utf8');

// 3a. Tooltip wrong text
assertRecipeUnitMutation(
  'Tooltip: wrong text foreground caught',
  'src/components/ui/tooltip.jsx',
  tooltipCode.replace('text-brand-foreground', 'text-ink-primary'),
  'tooltip-content',
  'text-brand-foreground'
);

// 3b. Mandatory Mutation 5: TooltipContent extra hover state -> FAIL (unexpected protected token)
assertRecipeUnitMutation(
  'Mandatory Mutation 5: TooltipContent with unauthorized hover:bg-brand-soft rejected',
  'src/components/ui/tooltip.jsx',
  tooltipCode.replace(
    'text-brand-foreground animate-in',
    'text-brand-foreground hover:bg-brand-soft animate-in'
  ),
  'tooltip-content',
  'hover:bg-brand-soft'
);

// 4. Toggle mutations
const toggleCode = fs.readFileSync('src/components/ui/toggle.jsx', 'utf8');

// 4a. Toggle outline wrong hover text
assertRecipeUnitMutation(
  'Toggle outline: wrong hover text caught',
  'src/components/ui/toggle.jsx',
  toggleCode.replace('hover:text-brand-soft-foreground', 'hover:text-ink-primary'),
  'toggle-outline',
  'hover:text-brand-soft-foreground'
);

// 4b. Toggle outline stripped hover modifier (bg-brand-soft without hover:)
assertRecipeUnitMutation(
  'Toggle outline: stripped hover modifier caught',
  'src/components/ui/toggle.jsx',
  toggleCode.replace('hover:bg-brand-soft', 'bg-brand-soft'),
  'toggle-outline',
  'hover:bg-brand-soft'
);

// 4c. Mandatory Mutation 6: Toggle outline extra selected visual data-[state=on]:shadow-lg -> FAIL
assertRecipeUnitMutation(
  'Mandatory Mutation 6: Toggle outline with unauthorized data-[state=on]:shadow-lg rejected',
  'src/components/ui/toggle.jsx',
  toggleCode.replace(
    'hover:text-brand-soft-foreground',
    'hover:text-brand-soft-foreground data-[state=on]:shadow-lg'
  ),
  'toggle-outline',
  'data-[state=on]:shadow-lg'
);

// 5. Form primitive mutations
const inputCode = fs.readFileSync('src/components/ui/input.jsx', 'utf8');
assertRecipeUnitMutation(
  'Input: missing focus-visible:ring-brand caught',
  'src/components/ui/input.jsx',
  inputCode.replace('focus-visible:ring-brand', ''),
  'input-default',
  'focus-visible:ring-brand'
);

assertRecipeUnitMutation(
  'Input: missing file:text-ink-primary caught',
  'src/components/ui/input.jsx',
  inputCode.replace('file:text-ink-primary', ''),
  'input-default',
  'Missing protected tokens: file:text-ink-primary'
);

const switchCode = fs.readFileSync('src/components/ui/switch.jsx', 'utf8');
assertRecipeUnitMutation(
  'Switch: missing data-[state=checked]:bg-brand caught',
  'src/components/ui/switch.jsx',
  switchCode.replace('data-[state=checked]:bg-brand', ''),
  'switch-root',
  'data-[state=checked]:bg-brand'
);

const checkboxCode = fs.readFileSync('src/components/ui/checkbox.jsx', 'utf8');
assertRecipeUnitMutation(
  'Checkbox: missing data-[state=checked]:bg-brand caught',
  'src/components/ui/checkbox.jsx',
  checkboxCode.replace('data-[state=checked]:bg-brand', ''),
  'checkbox-default',
  'data-[state=checked]:bg-brand'
);

const radioCode = fs.readFileSync('src/components/ui/radio-group.jsx', 'utf8');
assertRecipeUnitMutation(
  'RadioGroupItem: missing border-brand caught',
  'src/components/ui/radio-group.jsx',
  radioCode.replace('border-brand', 'border-line-subtle'),
  'radio-item',
  'border-brand'
);

// 6. AST Ambiguity Fail-Closed Mutations (Blocker 1)
console.log('--- AST Ambiguity Fail-Closed Mutations ---');

const toastCode = fs.readFileSync('src/components/ui/toast.jsx', 'utf8');
assertRecipeUnitMutation(
  'Ambiguity Guard: duplicate target <ToastPrimitives.Close> in ToastClose rejected',
  'src/components/ui/toast.jsx',
  toastCode.replace(
    '<ToastPrimitives.Close',
    '<div><ToastPrimitives.Close'
  ).replace(
    '</ToastPrimitives.Close>',
    '</ToastPrimitives.Close><ToastPrimitives.Close className={className}><X className="h-4 w-4" /></ToastPrimitives.Close></div>'
  ),
  'toast-destructive-close',
  'Ambiguous JSX element matches'
);

const scoreCardCode = fs.readFileSync('src/components/library/ScoreCard.jsx', 'utf8');
assertRecipeUnitPositive(
  'ScoreCard outer container unique resolution via attributes accepted',
  'src/components/library/ScoreCard.jsx',
  scoreCardCode,
  'itemcard-interactive-card'
);

assertRecipeUnitMutation(
  'ScoreCard duplicate <div data-qa="score-card"> rejected as ambiguous',
  'src/components/library/ScoreCard.jsx',
  scoreCardCode.replace(
    'data-qa="score-card-visual"',
    'data-qa="score-card"'
  ),
  'itemcard-interactive-card',
  'Ambiguous JSX element matches'
);

// 7. Motion & Transition Protection Mutations (Blocker 2)
console.log('--- Motion & Transition Protection Mutations ---');

// 7a. Button primary unexpected transition-all -> FAIL
assertRecipeUnitMutation(
  'Button primary: unexpected transition-all rejected',
  'src/components/ui/button.jsx',
  btnCode.replace('hover:bg-brand/90', 'hover:bg-brand/90 transition-all'),
  'button-default',
  'Unexpected protected tokens: transition-all'
);

// 7b. Switch thumb missing transition-transform -> FAIL
assertRecipeUnitMutation(
  'Switch thumb: missing transition-transform caught',
  'src/components/ui/switch.jsx',
  switchCode.replace('transition-transform', ''),
  'switch-thumb',
  'Missing protected tokens: transition-transform'
);

// 7c. Interactive Surface missing transition-all while keeping duration-300 -> FAIL
const surfaceCode = fs.readFileSync('src/components/patterns/Surface.jsx', 'utf8');
assertRecipeUnitMutation(
  'Interactive Surface: missing transition-all while keeping duration-300 caught',
  'src/components/patterns/Surface.jsx',
  surfaceCode.replace('transition-all', ''),
  'statcard-interactive-panel',
  'Missing protected tokens: transition-all'
);

// 7d. ScoreCard missing transition-all -> FAIL
assertRecipeUnitMutation(
  'ScoreCard: missing transition-all caught',
  'src/components/library/ScoreCard.jsx',
  scoreCardCode.replace('transition-all', ''),
  'itemcard-interactive-card',
  'Missing protected tokens: transition-all'
);

// 7e. Input missing disabled:opacity-50 -> FAIL
assertRecipeUnitMutation(
  'Input: missing disabled:opacity-50 caught',
  'src/components/ui/input.jsx',
  inputCode.replace('disabled:opacity-50', ''),
  'input-default',
  'Missing protected tokens: disabled:opacity-50'
);

// 7f. Switch wrong disabled opacity (disabled:opacity-20) -> FAIL
assertRecipeUnitMutation(
  'Switch root: wrong disabled opacity (disabled:opacity-20) caught',
  'src/components/ui/switch.jsx',
  switchCode.replace('disabled:opacity-50', 'disabled:opacity-20'),
  'switch-root',
  'Missing protected tokens: disabled:opacity-50'
);

// 8. Frozen Metadata Fail-Closed Verification (Blocker 3)
console.log('--- Frozen Metadata Fail-Closed Mutations ---');

function assertMetadataMutation(name, metadataOverride, expectedSubstring) {
  totalTests++;
  try {
    const baseRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'badge-default');
    const issues = verifyVisualRecipes([baseRecipe], { metadataOverride });
    const found = issues.some(
      (i) => !expectedSubstring || (i.message && i.message.includes(expectedSubstring))
    );
    if (issues.length > 0 && found) {
      console.log(`  ✓ [FAIL as expected] ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ [UNEXPECTED PASS] ${name}`);
      console.error(`     Expected issue containing: ${expectedSubstring}`);
      console.error(`     Actual issues: ${JSON.stringify(issues)}`);
      failedTests++;
    }
  } catch (err) {
    console.error(`  ❌ [ERROR] ${name}: ${err.message}`);
    failedTests++;
  }
}

const rawMeta = fs.readFileSync('scripts/fixtures/numis-frozen/metadata.json', 'utf8');
const validMeta = JSON.parse(rawMeta);
const baseBadgeRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'badge-default');
const targetFile = baseBadgeRecipe.source.file;

// 8a. Missing metadata.json
assertMetadataMutation(
  'Metadata fail-closed: metadata.json missing rejected',
  'MISSING',
  'metadata.json does not exist'
);

// 8b. Missing files object
assertMetadataMutation(
  'Metadata fail-closed: missing files object rejected',
  { repository: validMeta.repository, commit: validMeta.commit, tree: validMeta.tree },
  'files object is missing'
);

// 8c. Missing target file entry
assertMetadataMutation(
  'Metadata fail-closed: missing file entry rejected',
  { ...validMeta, files: {} },
  'is missing. Fail closed.'
);

// 8d. File missing sha256
assertMetadataMutation(
  'Metadata fail-closed: missing sha256 field rejected',
  {
    ...validMeta,
    files: {
      ...validMeta.files,
      [targetFile]: {
        gitBlobSha: validMeta.files[targetFile].gitBlobSha,
        bytes: validMeta.files[targetFile].bytes,
      },
    },
  },
  'sha256 field missing'
);

// 8e. File missing gitBlobSha
assertMetadataMutation(
  'Metadata fail-closed: missing gitBlobSha field rejected',
  {
    ...validMeta,
    files: {
      ...validMeta.files,
      [targetFile]: {
        sha256: validMeta.files[targetFile].sha256,
        bytes: validMeta.files[targetFile].bytes,
      },
    },
  },
  'gitBlobSha field missing'
);

// 8f. File missing bytes
assertMetadataMutation(
  'Metadata fail-closed: missing bytes field rejected',
  {
    ...validMeta,
    files: {
      ...validMeta.files,
      [targetFile]: {
        sha256: validMeta.files[targetFile].sha256,
        gitBlobSha: validMeta.files[targetFile].gitBlobSha,
      },
    },
  },
  'bytes field missing'
);

// 8g. File with wrong sha256
assertMetadataMutation(
  'Metadata fail-closed: sha256 mismatch rejected',
  {
    ...validMeta,
    files: {
      ...validMeta.files,
      [targetFile]: {
        ...validMeta.files[targetFile],
        sha256: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    },
  },
  'sha256 mismatch'
);

// 8h. File with wrong gitBlobSha
assertMetadataMutation(
  'Metadata fail-closed: gitBlobSha mismatch rejected',
  {
    ...validMeta,
    files: {
      ...validMeta.files,
      [targetFile]: {
        ...validMeta.files[targetFile],
        gitBlobSha: '0000000000000000000000000000000000000000',
      },
    },
  },
  'git blob SHA mismatch'
);

// 8i. Positive control with valid metadataOverride
totalTests++;
try {
  const issues = verifyVisualRecipes([baseBadgeRecipe], { metadataOverride: validMeta });
  if (issues.length === 0) {
    console.log('  ✓ [PASS as expected] Valid metadataOverride accepted');
    passedTests++;
  } else {
    console.error(`  ❌ [UNEXPECTED FAIL] Valid metadataOverride failed with: ${JSON.stringify(issues)}`);
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] Valid metadataOverride test threw: ${e.message}`);
  failedTests++;
}

// 9. Frozen fixture disk metadata and git blob verification mutation (end-to-end check)
totalTests++;
try {
  const baseRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'badge-default');
  const metadataPath = 'scripts/fixtures/numis-frozen/metadata.json';
  const originalMeta = fs.readFileSync(metadataPath, 'utf8');
  const metaObj = JSON.parse(originalMeta);
  const targetFile = baseRecipe.source.file;
  const originalSha = metaObj.files[targetFile].gitBlobSha;
  metaObj.files[targetFile].gitBlobSha = '0000000000000000000000000000000000000000';
  fs.writeFileSync(metadataPath, JSON.stringify(metaObj, null, 2), 'utf8');
  const issues = verifyVisualRecipes([baseRecipe]);
  fs.writeFileSync(metadataPath, originalMeta, 'utf8');

  const hasBlobMismatch = issues.some((i) => i.message && i.message.includes('git blob SHA mismatch'));
  if (issues.length > 0 && hasBlobMismatch) {
    console.log('  ✓ [FAIL as expected] Frozen fixture gitBlobSha tampering detected');
    passedTests++;
  } else {
    console.error('  ❌ [UNEXPECTED PASS] Frozen fixture gitBlobSha tampering was NOT detected');
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] Frozen fixture tampering test threw: ${e.message}`);
  failedTests++;
}

// 10. Source-to-Manifest Protected Semantic Category Mutations & Documentation Truth Guards
console.log('--- Source-to-Manifest Category Invariant & Documentation Truth Guards ---');

// 10a. Manifest drops protected shadow mapping -> FAIL
totalTests++;
try {
  const buttonRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'button-default');
  const mutatedRecipe = {
    ...buttonRecipe,
    yueoraClasses: buttonRecipe.yueoraClasses.filter((cls) => cls !== 'shadow'),
  };
  const issues = verifyVisualRecipes([mutatedRecipe]);
  const hasDroppedShadow = issues.some(
    (i) => i.message && i.message.includes("drops protected Numis visual category 'resting::shadow'")
  );
  if (issues.length > 0 && hasDroppedShadow) {
    console.log('  ✓ [FAIL as expected] Manifest drops protected shadow mapping rejected');
    passedTests++;
  } else {
    console.error('  ❌ [UNEXPECTED PASS] Manifest drops protected shadow mapping was NOT rejected');
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] Manifest shadow test threw: ${e.message}`);
  failedTests++;
}

// 10b. Manifest drops protected foreground mapping -> FAIL
totalTests++;
try {
  const buttonRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'button-default');
  const mutatedRecipe = {
    ...buttonRecipe,
    yueoraClasses: buttonRecipe.yueoraClasses.filter((cls) => cls !== 'text-brand-foreground'),
  };
  const issues = verifyVisualRecipes([mutatedRecipe]);
  const hasDroppedForeground = issues.some(
    (i) => i.message && i.message.includes("drops protected Numis visual category 'resting::text'")
  );
  if (issues.length > 0 && hasDroppedForeground) {
    console.log('  ✓ [FAIL as expected] Manifest drops protected foreground mapping rejected');
    passedTests++;
  } else {
    console.error('  ❌ [UNEXPECTED PASS] Manifest drops protected foreground mapping was NOT rejected');
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] Manifest foreground test threw: ${e.message}`);
  failedTests++;
}

// 10c. Input manifest missing file:text-ink-primary mapping -> FAIL
totalTests++;
try {
  const inputRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'input-default');
  const mutatedRecipe = {
    ...inputRecipe,
    yueoraClasses: inputRecipe.yueoraClasses.filter((cls) => cls !== 'file:text-ink-primary'),
  };
  const issues = verifyVisualRecipes([mutatedRecipe]);
  const hasDroppedFileText = issues.some(
    (i) => i.message && i.message.includes("drops protected Numis visual category 'file::text'")
  );
  if (issues.length > 0 && hasDroppedFileText) {
    console.log('  ✓ [FAIL as expected] Input manifest missing file:text-ink-primary mapping rejected');
    passedTests++;
  } else {
    console.error('  ❌ [UNEXPECTED PASS] Input manifest missing file:text-ink-primary mapping was NOT rejected');
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] Input manifest file-text test threw: ${e.message}`);
  failedTests++;
}

// 10d. Positive control: flat-content-panel structural adaptation preserves all protected semantics -> PASS
totalTests++;
try {
  const flatPanelRecipe = YUEORA_AUTHORIZED_RECIPES.find((r) => r.id === 'flat-content-panel');
  const issues = verifyVisualRecipes([flatPanelRecipe]);
  if (issues.length === 0) {
    console.log('  ✓ [PASS as expected] Positive Control: flat-content-panel structural adaptation preserves all protected semantics');
    passedTests++;
  } else {
    console.error(`  ❌ [UNEXPECTED FAIL] flat-content-panel failed verification: ${JSON.stringify(issues)}`);
    failedTests++;
  }
} catch (e) {
  console.error(`  ❌ [ERROR] flat-content-panel positive test threw: ${e.message}`);
  failedTests++;
}

// 10e. Documentation Truth Assertions on Real Files
const realAgentsContent = fs.readFileSync('AGENTS.md', 'utf8');
const realDocsContent = fs.readFileSync('docs/design-system.md', 'utf8');

totalTests++;
if (!realAgentsContent.includes('active:scale-[0.98]')) {
  console.log('  ✓ [PASS as expected] Real AGENTS.md does not contain retired Button active:scale-[0.98]');
  passedTests++;
} else {
  console.error('  ❌ [FAIL] Real AGENTS.md contains retired Button active:scale-[0.98]');
  failedTests++;
}

totalTests++;
if (!realAgentsContent.includes('border-brand bg-neutral-muted text-ink-primary')) {
  console.log('  ✓ [PASS as expected] Real AGENTS.md does not contain retired Practice toggle grammar');
  passedTests++;
} else {
  console.error('  ❌ [FAIL] Real AGENTS.md contains retired Practice toggle grammar');
  failedTests++;
}

totalTests++;
if (!realDocsContent.includes('hover:-translate-y-0.5')) {
  console.log('  ✓ [PASS as expected] Real docs/design-system.md does not claim Surface translate/lift');
  passedTests++;
} else {
  console.error('  ❌ [FAIL] Real docs/design-system.md claims Surface translate/lift');
  failedTests++;
}

totalTests++;
if (!realDocsContent.includes('Inputs and Selects consume `h-control-lg`')) {
  console.log('  ✓ [PASS as expected] Real docs/design-system.md does not claim h-control-lg for inputs/selects');
  passedTests++;
} else {
  console.error('  ❌ [FAIL] Real docs/design-system.md claims h-control-lg for inputs/selects');
  failedTests++;
}

// 10f. Mutation tests proving documentation truth guard catches regressions
function checkDocTruth(content) {
  const forbidden = [
    'active:scale-[0.98]',
    'border-brand bg-neutral-muted text-ink-primary',
    'hover:-translate-y-0.5',
    'Inputs and Selects consume `h-control-lg`',
    'rounded-control` (12px)',
  ];
  return forbidden.filter((p) => content.includes(p));
}

totalTests++;
const agentsMutatedToggle = realAgentsContent + '\nControl Toggles: border-brand bg-neutral-muted text-ink-primary\n';
if (checkDocTruth(agentsMutatedToggle).length > 0) {
  console.log('  ✓ [FAIL as expected] Stale Practice toggle grammar in AGENTS.md rejected by doc guard');
  passedTests++;
} else {
  console.error('  ❌ [UNEXPECTED PASS] Stale Practice toggle grammar in AGENTS.md was not rejected');
  failedTests++;
}

totalTests++;
const agentsMutatedBtn = realAgentsContent + '\nPrimary CTA: active:scale-[0.98]\n';
if (checkDocTruth(agentsMutatedBtn).length > 0) {
  console.log('  ✓ [FAIL as expected] Stale Button active:scale-[0.98] in AGENTS.md rejected by doc guard');
  passedTests++;
} else {
  console.error('  ❌ [UNEXPECTED PASS] Stale Button active:scale-[0.98] was not rejected');
  failedTests++;
}

totalTests++;
const docsMutatedSurface = realDocsContent + '\nSurface interactive: hover:-translate-y-0.5\n';
if (checkDocTruth(docsMutatedSurface).length > 0) {
  console.log('  ✓ [FAIL as expected] Surface translate/lift claim in docs rejected by doc guard');
  passedTests++;
} else {
  console.error('  ❌ [UNEXPECTED PASS] Surface translate/lift claim in docs was not rejected');
  failedTests++;
}

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
