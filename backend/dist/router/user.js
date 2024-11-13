"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const js_sdk_1 = require("@reclaimprotocol/js-sdk");
const express_1 = require("express");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
userRouter.post("/api/user/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, dateOfBirth, gender, graduatedFrom, currentlyWorking } = req.body;
        const user = yield prisma.user.create({
            data: { name, dateOfBirth, gender, graduatedFrom, currentlyWorking },
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create user profile" });
    }
}));
userRouter.get("/reclaim/generate-config", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const APP_ID = process.env.APP_ID;
    const APP_SECRET = process.env.APP_SECRET;
    const PROVIDER_ID = process.env.PROVIDER_ID;
    try {
        const reclaimProofRequest = yield js_sdk_1.ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
        reclaimProofRequest.setAppCallbackUrl("http://localhost:3000/api/v1/user/receive-proofs");
        const reclaimProofRequestConfig = reclaimProofRequest.toJsonString();
        res.json({ reclaimProofRequestConfig });
        return;
    }
    catch (error) {
        console.error("Error generating request config:", error);
        res.status(500).json({ error: "Failed to generate request config" });
        return;
    }
}));
// Route to receive proofs
userRouter.post("/receive-proofs", (req, res) => {
    const proofs = req.body;
    console.log("Received proofs:", proofs);
    // Process the proofs here
    res.sendStatus(200);
    return;
});
exports.default = userRouter;
