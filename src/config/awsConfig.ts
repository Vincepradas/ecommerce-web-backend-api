import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

(async () => {
  try {
    const command = new ListBucketsCommand({});
    const data = await s3.send(command);

    console.log("Buckets:", data.Buckets);
  } catch (err) {
    console.error("Error listing buckets:", err);
  }
})();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: () => `${process.env.AWS_BUCKET_NAME}`,
    acl: "public-read",
    metadata: (_req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req, file, cb) => {
      const fileName = `${Date.now().toString()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
}).fields([
  { name: "media", maxCount: 5 },
  { name: "thumbnail", maxCount: 1 },
]);

export default upload;
