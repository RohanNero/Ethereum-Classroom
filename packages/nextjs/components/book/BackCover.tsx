import React from "react";

interface BackCoverProps {
  currentPage: number;
  goToPage: (page: number) => void;
}

/** This component contains the styling for the book's back cover */
const BackCover: React.FC<BackCoverProps> = ({ currentPage, goToPage }) => {
  return (
    <div className="relative bg-gray-200 border-gray-500 rounded p-5 w-1/3 h-[85%]">
      <div className="flex h-full flex-col items-center justify-center">
        {/* Darker gray column */}
        <div className="absolute w-[17%] bg-gray-300 h-full border-gray-500 rounded-l right-0"></div>
        <div className="">
          <button
            className="absolute bottom-0 text-gray-400 left-0 px-2 py-1 border ml-2 mb-2 font-fantasy hover:text-black"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackCover;
