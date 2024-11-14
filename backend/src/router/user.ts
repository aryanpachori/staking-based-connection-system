import { PrismaClient } from "@prisma/client";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { Router } from "express";
import dotenv from "dotenv"
dotenv.config()
const userRouter = Router();
const prisma = new PrismaClient();
userRouter.post("/api/user/create", async (req, res) => {
  try {
    const { name, dateOfBirth, gender, graduatedFrom, currentlyWorking } =
      req.body;
    const user = await prisma.user.create({
      data: { name, dateOfBirth, gender, graduatedFrom, currentlyWorking },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user profile" });
  }
});
userRouter.get("/reclaim/generate-config", async (req, res) => {
  const APP_ID = process.env.APP_ID!;
  const APP_SECRET = process.env.APP_SECRET!;
  const PROVIDER_ID = process.env.PROVIDER_ID!;


  try {
    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID
    );

    reclaimProofRequest.setAppCallbackUrl(
      "https://2157-119-82-83-136.ngrok-free.app/api/v1/user/receive-proofs"
    );

    const reclaimProofRequestConfig = reclaimProofRequest.toJsonString();

    res.json({ reclaimProofRequestConfig });
    return;
  } catch (error) {
    console.error("Error generating request config:", error);
    res.status(500).json({ error: "Failed to generate request config" });
    return;
  }
});

// Route to receive proofs
userRouter.post("/receive-proofs", (req, res) => {
  const proofs = req.body;
  console.log("Received proofs:", proofs);
  // Process the proofs here
  res.sendStatus(200);
  return;
});

export default userRouter;
