import React from 'react';

const Select = ({ children, value, onChange, className = '', ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;
