import React from "react";

interface TableOfContentsProps {
  goToPage: (page: number) => void;
}

/** This component displays the book's table of contents */
const TableOfContents: React.FC<TableOfContentsProps> = ({ goToPage }) => {
  return (
    <div
      className={`w-1/2 pl-2 right-0 absolute bg-gray-100 border-gray-400 border-opacity-30 rounded border h-[95%]        
    `}
    >
      <div className="mt-4">
        <div className="font-fantasy text-gray-400">
          <h3 className="left-[30%] text-3xl absolute "> Table of Contents </h3>
          <ul className="absolute bottom-1/2 left-[31%]">
            <li className="text-xl mb-4 hover:text-black">
              {/* Button Linking user to EIP section of the book, will have to update hard-coded page number */}
              <button onClick={() => goToPage(3)}>EIP Section</button>
            </li>
            <li className="text-xl hover:text-black">
              {/* Button Linking user to Extras section of the book, will have to update hard-coded page number */}
              <button onClick={() => goToPage(4)}>Extras Section</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;
