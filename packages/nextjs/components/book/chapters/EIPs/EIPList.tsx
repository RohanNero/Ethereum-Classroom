import React from "react";
import Link from "next/link";

/** Contains all the EIP list item data */
const EIPData = [
  // { href: "/book/EIPs/6_Suicide", text: "EIP 6 - Suicide" },
  { href: "/book/EIPs/7_Delegatecall", text: "EIP 7 - Delegatecall" }, // Start with this
  { href: "/book/EIPs/20_Token", text: "EIP 20 - Token" }, // With this
  // { href: "/book/EIPs/50_Mixed-CaseChecksumAddressEncoding", text: "EIP 50 - Mixed-Case Checksum Address Encoding" },
  // { href: "/book/EIPs/137_EthereumDomainNameService", text: "EIP 137 - Ethereum Domain Name Service" },
  // { href: "/book/EIPs/155_SimpleReplayAttackProtection", text: "EIP 155 - Simple Replay Attack Protection" },
  // { href: "/book/EIPs/170_SpuriousDragon", text: "EIP 170 - Spurious Dragon" },
  // { href: "/book/EIPs/173_Ownable", text: "EIP 173 - Ownable" },
  { href: "/book/EIPs/191_PersonalMessage", text: "EIP 191 - Personal Messages" }, // This
  { href: "/book/EIPs/712_StructuredMessage", text: "EIP 712 - Structured Messages" }, // And this
  { href: "/book/EIPs/721_NonFungibleToken", text: "EIP 721 - Non Fungible Token" }, // This too
  // { href: "/book/EIPs/1167_Proxy", text: "EIP 1167 - Proxy" },
  // { href: "/book/EIPs/1967_ProxyStorage", text: "EIP 1967 - Proxy Storage" },
  // { href: "/book/EIPs/3156_FlashLoans", text: "EIP 3156 - Flash Loans" },
  // { href: "/book/EIPs/4626_Vault", text: "EIP 4626 - Vault" }, // Also this one
  // { href: "/book/EIPs/6049_SelfDestruct", text: "EIP 6049 - Self Destruct" },
  // { href: "/book/EIPs/6105_NFTMarket", text: "EIP 6105 - NFT Market" },
];

/** Handles rendering the EIP list items */
const renderEIPs = () => {
  const eips = [];

  for (let i = 0; i < EIPData.length; i++) {
    console.log(EIPData[i]);
    eips.push(
      <li key={i} className={`${i % 2 === 0 ? "text-gray-400" : "text-gray-300"} mb-2 hover:text-black`}>
        <Link href={EIPData[i].href}>{EIPData[i].text}</Link>
      </li>,
    );
  }

  return eips;
};

/** This component handles what content is displayed inside the book */
const EIPs = () => {
  return (
    <ul className="font-fantasy text-2xl absolute top-0 left-[10%] max-h-full py-4 overflow-y-auto">{renderEIPs()}</ul>
  );
};

export default EIPs;
