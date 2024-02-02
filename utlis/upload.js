import multer, { diskStorage } from 'multer';
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/upload');
  },
  filename: (req, file, cb) => {
    const fileExt = file.originalname.split('.')[1];
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExt);
  },
});

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const fileFilter = (req, file, cb) => {
  // const mimetype = file.mimetype;
  // console.log(mimetype);
  // To accept the file pass `true`, like so:
  // if (mimetype.startsWith('image')) cb(null, true);

  const fileExt = file.originalname.split('.')[1];

  if (ALLOWED_EXT.includes(fileExt)) cb(null, true);
  // To reject this file pass `false`, like so:
  // cb(null, false);
  else {
    const err = new Error();
    err.message = `Wrong file type, only ${ALLOWED_EXT.join(', ')} allowed!`;
    err.statusCode = 400;
    console.log(err);
    cb(err);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
