"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const company_1 = require("../controllers/company");
const router = (0, express_1.Router)();
exports.router = router;
router.get("/", company_1.getCompany);
router.post("/", company_1.getAllCompany);
