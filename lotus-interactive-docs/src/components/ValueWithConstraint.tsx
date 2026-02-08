import { ConstraintBadge, type ConstraintSeverity } from './ConstraintBadge';
import { ConstraintTooltip, type ConstraintScope } from './ConstraintTooltip';

interface ValueWithConstraintProps {
  /** The value to display */
  children: React.ReactNode;
  /** Whether a constraint is currently affecting this value */
  isConstrained: boolean;
  /** Severity of the constraint */
  severity?: ConstraintSeverity;
  /** Badge label (e.g., "Bound", "Cascading", "Near limit") */
  badgeLabel?: string;
  /** Constraint title for tooltip */
  constraintTitle?: string;
  /** Explanation of why this constraint exists */
  constraintWhy?: string;
  /** Protocol primitive name */
  primitive?: string;
  /** Constraint scope */
  scope?: ConstraintScope;
  /** Tranche index if scope is 'tranche' */
  trancheIndex?: number;
  /** Math steps for "Show math" section */
  mathSteps?: string[];
  /** Doc link */
  docLink?: string;
  /** Whether to show the badge inline with the value */
  showBadge?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * ValueWithConstraint - Wrapper for any constrained output
 *
 * When a constraint is active:
 * - Adds a dashed amber border
 * - Applies amber background tint
 * - Optionally shows a ConstraintBadge
 * - Wraps in ConstraintTooltip for rich explanation
 */
export function ValueWithConstraint({
  children,
  isConstrained,
  severity = 'active',
  badgeLabel = 'Bound',
  constraintTitle = 'Constraint Active',
  constraintWhy = 'This value is currently constrained.',
  primitive,
  scope,
  trancheIndex,
  mathSteps,
  docLink,
  showBadge = true,
  className = '',
}: ValueWithConstraintProps) {
  if (!isConstrained) {
    return <span className={className}>{children}</span>;
  }

  const content = (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-1.5 py-0.5 -mx-1.5 -my-0.5
        rounded
        border border-dashed border-amber-600/60
        bg-amber-500/10
        ${className}
      `}
    >
      {children}
      {showBadge && (
        <ConstraintBadge
          severity={severity}
          label={badgeLabel}
        />
      )}
    </span>
  );

  // If we have tooltip content, wrap in ConstraintTooltip
  if (constraintTitle && constraintWhy) {
    return (
      <ConstraintTooltip
        title={constraintTitle}
        why={constraintWhy}
        primitive={primitive}
        scope={scope}
        trancheIndex={trancheIndex}
        mathSteps={mathSteps}
        docLink={docLink}
      >
        {content}
      </ConstraintTooltip>
    );
  }

  return content;
}

export default ValueWithConstraint;
