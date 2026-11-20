import { scanPageAppearanceContent } from './lib/appearance-guard.mjs';

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
