import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import get from "lodash/get";
import truncate from "lodash/truncate";
import { getPlaiceholder } from "plaiceholder";
import slugify from "slugify";

export const handleUpload = async (
  userId: string,
  name: string,
  buffer: Buffer
) => {
  let url = "";
  let key = "";
  const slug = truncate(
    slugify(name, {
      lower: true,
      trim: true,
      strict: true,
      replacement: "_",
    }),
    { length: 30, separator: "" }
  );

  try {
    const uploadObj = new Upload({
      client: new S3Client({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_SECRET_KEY!,
        },
        region: process.env.S3_REGION!,
      }),
      params: {
        Bucket: process.env.S3_BUCKET!,
        Key: `${userId}_${slug}`,
        Body: buffer,
      },
    });

    const upload = await uploadObj.done();

    url = get(upload, "Location", "");
    key = get(upload, "Key", "");

    console.log(upload);
  } catch (error) {
    console.error(error);
  }

  return { url, key };
};

export const generatePlaceholder = async (buffer: Buffer) => {
  const { base64 } = await getPlaiceholder(buffer, {
    autoOrient: true,
    size: 16,
  });

  return base64;
};
