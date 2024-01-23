import pinataSDK from "@pinata/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const pinataApiKey: string = process.env.PINATA_API_KEY || "";
const pinataApiSecret: string = process.env.PINATA_API_SECRET || "";
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

interface PinataOptions {
  pinataMetadata: {
    name: string;
  };
}

async function uploadImages(imagesFilePath: string): Promise<{ responses: any[]; files: string[] }> {
  const fullImagesPath: string = path.resolve(imagesFilePath);

  // Filter the files in case they are files that are not .png
  const files: string[] = fs.readdirSync(fullImagesPath).filter(file => file.includes(".png"));

  const responses: any[] = [];
  console.log("Uploading to IPFS");

  for (const fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
    const options: PinataOptions = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
      responses.push(result);
    } catch (err) {
      console.log(err);
    }
  }
  return { responses, files };
}

interface Metadata {
  name: string;
  // Add other properties of your metadata object here
}

async function uploadTokenUriMetadata(metadata: Metadata): Promise<any | null> {
  const options: PinataOptions = {
    pinataMetadata: {
      name: metadata.name,
    },
  };
  try {
    const response = await pinata.pinJSONToIPFS(metadata, options);
    console.log("response:", response);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

export { uploadImages, uploadTokenUriMetadata };

const miladyTemplate = {
  name: "mila...dy..?",
  description: "I love you!",
  image: "ipfs://Qme5kLkoKapfqJoUXwKrwpX3obXczMq9tUq1gQszfP1tS8",
};
const baycTemplate = {
  name: "Special Edition Board Ape",
  description: "I'm rich!",
  image: "ipfs://QmX2wMTeLE8SsFbXyZ57FRKpCeECBcze3jaYShdPnW9C46",
};
const punkTemplate = {
  name: "krip toe punc",
  description: "Defy the norm or something!",
  image: "ipfs://QmW1iwbnmLhR9Eno2fgfZzAiq3xSayKoXe5wkXrRhRzed3",
};

const handleUpload = () => {
  [miladyTemplate, baycTemplate, punkTemplate].forEach(element => {
    console.log("Uploading:", element);
    console.log("pinata secret:", pinataApiSecret);
    console.log("pinata key:", pinataApiKey);
    const response = uploadTokenUriMetadata(element);
    console.log("response:", response);
  });
};

handleUpload();
