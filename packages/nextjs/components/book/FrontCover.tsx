import React from "react";

interface FrontCoverProps {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  renderNavigationLinks: () => React.ReactNode;
}

/** This component contains the styling for the book's front cover */
const FrontCover: React.FC<FrontCoverProps> = ({ currentPage, totalPages, goToPage, renderNavigationLinks }) => {
  return (
    <div className="relative bg-gray-200 border-gray-500 rounded p-5 w-1/3 h-[85%] shadow-xl">
      <div className="flex h-full flex-col items-center justify-center">
        {/* Darker gray column */}
        <div className="absolute w-[17%] bg-gray-300 h-full border-gray-500 rounded-l left-0"></div>
        <div className="relative font-fantasy text-4xl text-gray-400 -mt-16 -mr-4">Ethereum</div>
        <div className="">
          {currentPage > 1 && (
            <button
              className="absolute bottom-0 left-0 px-2 py-1 border ml-2 mb-2"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          )}
          {currentPage > 1 && (
            <ul className="flex absolute bottom-0 left-1/2 mb-2 transform -translate-x-1/2">
              {renderNavigationLinks()}
            </ul>
          )}
          <button
            className="absolute bottom-0 text-gray-400 right-0 px-2 py-1 border mr-2 mb-1 font-fantasy hover:text-black"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrontCover;
