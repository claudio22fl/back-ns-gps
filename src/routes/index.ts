import { Router } from "express";
import { readdirSync } from "fs";

const PATH_ROUTES = `${__dirname}`;

const router = Router();

const cleanFileName = (fileName: string) => {
  const file = fileName.split(".").shift();
  return file;
};

readdirSync(PATH_ROUTES).filter((file) => {
  const fileName = cleanFileName(file);
  if (fileName !== "index") {
    import(`./${fileName}`).then((module) => {
      router.use(`/${fileName}`, module.router);
    });
  }
  return null;
});

export { router };
