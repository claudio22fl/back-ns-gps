import { Router } from "express";
import {
  createClient,
  getClientById,
  getClients,
  updateClient,
} from "../controllers/client";

const router = Router();

router.post("/", getClients);
router.get("/:id", getClientById);
router.post("/create", createClient);
router.put("/:id", updateClient);

export { router };
