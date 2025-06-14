import React from 'react';

/**
 * Select Component
 * A reusable dropdown (select) field with consistent styling.
 *
 * @param {object} props - Component props.
 * @param {string} [props.value] - The current value of the select input.
 * @param {function} [props.onChange] - Callback function for select value changes.
 * @param {Array<React.ReactNode>} props.children - The <option> elements to be rendered inside the select.
 * @param {string} [props.className] - Additional CSS classes to apply to the select.
 * @param {boolean} [props.required] - HTML required attribute.
 * @param {boolean} [props.disabled] - HTML disabled attribute.
 * @param {object} [props.rest] - Any other HTML attributes to pass to the select element.
 */
const Select = ({ value, onChange, children, className = '', required = false, disabled = false, ...rest }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
};

export default Select;
