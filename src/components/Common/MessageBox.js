import React, { useState, useEffect } from 'react';

const MessageBox = ({ message, type = 'error', duration = 6000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!isVisible || !message) return null;

  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="message-box-container fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm">
      <div className={`message-box ${typeClasses[type]} text-white p-4 rounded-lg shadow-xl flex justify-between items-center`}>
        <span>{message}</span>
        <button onClick={() => setIsVisible(false)} className="message-box-close text-white text-2xl ml-4 cursor-pointer focus:outline-none">
          &times;
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
