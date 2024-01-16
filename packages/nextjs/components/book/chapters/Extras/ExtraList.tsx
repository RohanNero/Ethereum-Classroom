import React from "react";
import Link from "next/link";

/** Contains all the EIP list item data */
const ExtraData = [
  // { href: "/blockexplorer", text: "ABI Encoding" },
  // { href: "/blockexplorer", text: "ABI Decoding" },
  // { href: "/blockexplorer", text: "Merkle Trees" },
  { href: "/", text: "Coming soon!" },
];

/** Handles rendering the EIP list items */
const renderExtras = () => {
  const eips = [];

  for (let i = 0; i < ExtraData.length; i++) {
    console.log(ExtraData[i]);
    eips.push(
      <li key={i} className={`${i % 2 === 0 ? "text-gray-400" : "text-gray-300"} mb-2 hover:text-black`}>
        <Link href={ExtraData[i].href}>{ExtraData[i].text}</Link>
      </li>,
    );
  }

  return eips;
};

/** This component handles what content is displayed inside the book */
const ExtraList = () => {
  return (
    <ul className="font-fantasy text-2xl absolute top-0 left-[10%] max-h-full py-4 overflow-y-auto">
      {renderExtras()}
    </ul>
  );
};

export default ExtraList;
