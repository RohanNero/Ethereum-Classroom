import React, { useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import BackCover from "~~/components/book/BackCover";
import FrontCover from "~~/components/book/FrontCover";
import OpenBook from "~~/components/book/OpenBook";

const Home: NextPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  // Change this to the total number of pages in your book
  // 1 cover page + 1 table of contents + pages + 1 ending page + 1 back cover
  // 4 + amount of chapters
  // totalPages - 4 = amount of chapters
  const totalPages = 6;

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderNavigationLinks = () => {
    const links = [];

    for (let i = 1; i <= totalPages; i++) {
      links.push(
        <li key={i}>
          <button
            className={`px-2 py-1 mx-1 border ${i === currentPage ? "text-black" : "text-gray-400"}`}
            onClick={() => goToPage(i)}
          >
            {i}
          </button>
        </li>,
      );
    }

    return links;
  };

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col h-screen pt-10">
        {/* Front Cover */}
        {currentPage === 1 && (
          <FrontCover
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            renderNavigationLinks={renderNavigationLinks}
          />
        )}
        {/* Open Book */}
        {currentPage > 1 && currentPage < totalPages && (
          <OpenBook
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            renderNavigationLinks={renderNavigationLinks}
          />
        )}
        {/* Back Cover */}
        {currentPage === totalPages && <BackCover currentPage={currentPage} goToPage={goToPage} />}
      </div>
    </>
  );
};

export default Home;
