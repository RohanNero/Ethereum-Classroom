import React from "react";
import EIPCoverPage from "./chapters/EIPs/EIPCoverPage";
import EIPList from "./chapters/EIPs/EIPList";
import ExtraList from "./chapters/Extras/ExtraList";
import ExtrasCoverPage from "./chapters/Extras/ExtrasCoverPage";
import FinalPage from "./chapters/FinalPage";
import TableOfContents from "./chapters/TableOfContents";

interface PageContentProps {
  currentPage: number;
  goToPage: (page: number) => void;
  totalPages: number;
}

// These are essentially each chapter in the book, to add more you must update `totalPages` in pages/index.tsx
const pageComponents: Record<number, { left: React.ReactElement; right: React.ReactElement }> = {
  3: { left: <EIPCoverPage />, right: <EIPList /> },
  4: { left: <ExtrasCoverPage />, right: <ExtraList /> },
};

// Handles displaying the page content
const PageContent: React.FC<PageContentProps> = ({ currentPage, goToPage, totalPages }) => {
  // Is this repetive to contain the div everytime? Or necessary? Lets move the code to the child component
  console.log("current Page:", currentPage);
  // First open page is the table of contents
  if (currentPage == 2) {
    return <TableOfContents goToPage={goToPage} />;
  } else if (currentPage > 2 && currentPage < totalPages - 1) {
    return (
      <>
        {/* Left page */}
        <div
          className={`w-1/2 pl-2 left-0 absolute bg-gray-100 border-gray-400 border-opacity-30 rounded border h-[95%]`}
        >
          <div className="mt-4">{pageComponents[currentPage].left}</div>
        </div>
        {/* Right page */}
        <div
          className={`w-1/2 pl-2 right-0 absolute bg-gray-100 border-gray-400 border-opacity-30 rounded border h-[95%]`}
        >
          {pageComponents[currentPage].right}
        </div>
      </>
    );
  } else if (currentPage == totalPages - 1) {
    // Page before the back cover is a credits/special message page?
    return <FinalPage />;
  } else {
    // Return null if none of the conditions are met
    return null;
  }
};

export default PageContent;
