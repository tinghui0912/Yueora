import React from 'react';
import { Toggle } from '@/components/ui/toggle';

/**
 * PracticeControlButton — Domain control toggle wrapper for PracticeSession using canonical Toggle.
 * Follows Numis control toggle grammar: uses canonical Toggle primitive with outline variant.
 *
 * @param {React.ComponentProps<typeof Toggle> & { active?: boolean, icon?: React.ElementType, onClick?: () => void }} props
 */
export function PracticeControlButton({
  active = false,
  onClick,
  onPressedChange,
  className = '',
  children,
  icon: Icon = null,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  ...props
}) {
  return (
    <Toggle
      pressed={ariaPressed === true || ariaPressed === 'true' || (ariaPressed === undefined && Boolean(active))}
      onPressedChange={onPressedChange ?? (() => onClick && onClick())}
      variant="outline"
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      {Icon && <Icon className="icon-xs shrink-0" aria-hidden="true" />}
      {children}
    </Toggle>
  );
}

export default PracticeControlButton;
