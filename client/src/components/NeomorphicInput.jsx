import { forwardRef } from 'react';

/**
 * Reusable neomorphic form field.
 * Supports both <input> and <textarea> via the `as` prop.
 *
 * Usage:
 *   <NeomorphicInput label="Full Name" name="name" value={value} onChange={onChange} />
 *   <NeomorphicInput as="textarea" label="Message" name="message" rows={5} ... />
 *   <NeomorphicInput as="select" label="Department" ...>{options}</NeomorphicInput>
 */
const NeomorphicInput = forwardRef(function NeomorphicInput(
  { label, as = 'input', className = '', error, children, ...props },
  ref
) {
  const Tag = as;

  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-deepblue/80 mb-2">
          {label}
        </span>
      )}

      <Tag
        ref={ref}
        className={`neo-input w-full text-sm ${
          as === 'select' ? 'appearance-none cursor-pointer' : ''
        } ${error ? 'ring-2 ring-red-300' : ''} ${className}`}
        {...props}
      >
        {children}
      </Tag>

      {error && (
        <span className="block text-xs text-red-500 mt-1.5">{error}</span>
      )}
    </label>
  );
});

export default NeomorphicInput;