import { Router } from "express";
import { getAllCompany, getCompany } from "../controllers/company";

const router = Router();

router.get("/", getCompany);
router.post("/", getAllCompany);

export { router };
