import React from 'react';

/**
 * Input Component
 * A reusable input field with consistent styling.
 *
 * @param {object} props - Component props.
 * @param {string} props.type - The HTML input type (e.g., 'text', 'email', 'password', 'date').
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {string} [props.value] - The current value of the input.
 * @param {function} [props.onChange] - Callback function for input value changes.
 * @param {string} [props.className] - Additional CSS classes to apply to the input.
 * @param {boolean} [props.required] - HTML required attribute.
 * @param {boolean} [props.disabled] - HTML disabled attribute.
 * @param {object} [props.rest] - Any other HTML attributes to pass to the input element.
 */
const Input = ({ type, placeholder, value, onChange, className = '', required = false, disabled = false, ...rest }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out ${className}`}
      {...rest}
    />
  );
};

export default Input;
