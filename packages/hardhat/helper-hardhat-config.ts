const networkConfig = {
  31337: {
    name: "localhost",
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
  11155111: {
    name: "sepolia",
    goldContract: "0x2C898f978D600F13B3dF62Bce000c989c85F08Ad",
  },
  137: {
    name: "polygon",
    goldContract: "0x93b7e2F9E77124832ff4464CEaC2e224655E0B67",
  },
  80001: {
    name: "polygonMumbai",
    goldContract: "0x1d83f96146C631250a2793Bfe4bc0DeD265E4E50",
  },
};

export default networkConfig;
