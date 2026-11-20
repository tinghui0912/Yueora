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
  'Surface with interactive hover motion',
  `<Surface padding="lg" interactive className="group hover:-translate-y-1 transition-all duration-300" />`
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
