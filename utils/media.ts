import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import get from "lodash/get";
import { nanoid } from "nanoid";
import { getPlaiceholder } from "plaiceholder";

export const handleUpload = async (
  userId: string,
  name: string,
  buffer: Buffer
) => {
  let url = "";
  let key = "";

  try {
    const uploadObj = new Upload({
      client: new S3Client({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION!,
      }),
      params: {
        Bucket: process.env.S3_BUCKET!,
        Key: `${nanoid()}_${userId}_${name}`,
        Body: buffer,
        ACL: "public-read",
      },
    });

    const upload = await uploadObj.done();

    url = get(upload, "Location", "");
    key = get(upload, "Key", "");
  } catch (error) {
    console.error("error while executing `handleUpload`: ", error);
  }

  return { url, key };
};

export const generatePlaceholder = async (buffer: Buffer) => {
  let base64 = "";
  try {
    const { base64: placeholder } = await getPlaiceholder(buffer, {
      autoOrient: true,
      size: 16,
    });
    base64 = placeholder;
  } catch (error) {
    console.error("error while executing `generatePlaceholder`: ", error);
  }

  return base64;
};
