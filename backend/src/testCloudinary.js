import dotenv from "dotenv";

dotenv.config({ quiet: true });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const imageUrl =
  "https://res.cloudinary.com/demo/image/upload/sample.jpg";

try {
  const credentials = Buffer.from(
    `${apiKey}:${apiSecret}`
  ).toString("base64");

  const formData = new URLSearchParams();

  formData.append("file", imageUrl);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    }
  );

  const text = await response.text();

  console.log("=================================");
  console.log("STATUS:", response.status);
  console.log("STATUS TEXT:", response.statusText);
  console.log("=================================");
  console.log("RESPONSE:");
  console.log(text);
  console.log("=================================");

} catch (error) {
  console.error("REQUEST ERROR:", error);
}