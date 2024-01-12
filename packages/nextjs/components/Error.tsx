import React from "react";

interface ErrorProps {
  errorMessage: string;
  onClose: () => void;
}

// Generic error popup component for error handling
const Error: React.FC<ErrorProps> = ({ errorMessage, onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-300 p-8 rounded shadow-md max-w-3xl max-h-md overflow-y-auto font-mono">
        <p className="text-gray-500 text-lg mb-4">{errorMessage.toString()}</p>
        <button
          className="bg-gray-200 text-gray-500 px-4 py-2 rounded hover:-translate-y-1 focus:outline-none focus:ring focus:border-gray-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Error;
