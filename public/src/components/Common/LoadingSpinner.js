import React from 'react';

const LoadingSpinner = ({ message = 'Loading data...' }) => {
  return (
    <div className="flex justify-center items-center h-[40vh] my-8">
      <div className="spinner border-4 border-gray-200 border-t-blue-900 rounded-full w-10 h-10 animate-spin"></div>
      <p className="ml-3 text-lg text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
