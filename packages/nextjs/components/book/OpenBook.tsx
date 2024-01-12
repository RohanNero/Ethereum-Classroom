import React from "react";
import PageContent from "./PageContent";

interface OpenBookProps {
  currentPage: number;
  goToPage: (page: number) => void;
  totalPages: number;
  renderNavigationLinks: () => React.ReactNode;
}

/** This contains the styling for the open book as well as the PageContent component*/
const OpenBook: React.FC<OpenBookProps> = ({ currentPage, goToPage, totalPages, renderNavigationLinks }) => {
  return (
    <div className="flex-row relative bg-gray-200 border-gray-500 rounded p-5 w-2/3 h-[85%]">
      <div className="flex relative pb-6 bg-gray-200 w-full h-full">
        {/* Custom PageContent component handles what displays on the page */}
        <PageContent currentPage={currentPage} goToPage={goToPage} totalPages={totalPages} />
      </div>
      {/* Buttons to navigate pages (Previous, Next) */}
      <div className="">
        {currentPage > 1 && (
          <button
            className="absolute bottom-0 text-gray-400 left-0 px-2 py-1 border ml-2 mb-2 font-fantasy hover:text-black"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        )}
      </div>
      <button
        className="absolute bottom-0 text-gray-400 right-0 px-2 py-1 border mr-2 mb-1 font-fantasy hover:text-black"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      {currentPage > 1 && (
        <ul className="absolute bottom-0 right-[41.25%] flex mb-1 font-fantasy">{renderNavigationLinks()}</ul>
      )}
    </div>
  );
};

export default OpenBook;
