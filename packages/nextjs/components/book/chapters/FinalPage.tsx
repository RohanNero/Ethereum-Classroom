import React from "react";

/** This component displays the book's final page */
const FinalPage = () => {
  return (
    <div
      className={`w-1/2 pl-2 left-0 absolute bg-gray-100 border-gray-400 border-opacity-30 rounded border h-[95%]        
    `}
    >
      <div className="mt-4">
        <div className="font-fantasy text-gray-400">
          <h3 className="left-[30%] text-3xl absolute"> Final Page </h3>
        </div>
      </div>
    </div>
  );
};

export default FinalPage;
