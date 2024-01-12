import React from "react";

/** This component displays the EIP Section welcome page */
const ExtrasCoverPage = () => {
  return (
    <div className="font-fantasy text-gray-400">
      <h3 className="left-[30%] text-3xl absolute "> Extras Section </h3>
      <span className="absolute top-[14%]">
        Welcome to the Extras section! This section includes a list of Ethereum concepts that are not necessarily EIPs
        but are still important.{" "}
      </span>
    </div>
  );
};

export default ExtrasCoverPage;
