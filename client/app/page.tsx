"use client";
import React, { useEffect, useState } from "react";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import { Proof } from "@reclaimprotocol/js-sdk";
import { useQRCode } from "next-qrcode";
import Link from "next/link";

export default function Home() {
  const [verificationReqUrl, setVerificationReqUrl] = useState<
    string | undefined
  >("");
  const [extracted, setExtracted] = useState<any>(null);
  const { Canvas } = useQRCode();
  const [reclaimProofRequest, setReclaimProofRequest] =
    useState<ReclaimProofRequest | null>(null);

  useEffect(() => {
    // Initialize the ReclaimProofRequest when the component mounts
    initializeReclaimProofRequest();
  }, []);

  async function initializeReclaimProofRequest() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/user/reclaim/generate-config"
      );
      const { reclaimProofRequestConfig } = await response.json();

      // Reconstruct the ReclaimProofRequest object
      const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(
        reclaimProofRequestConfig
      );
      setReclaimProofRequest(reclaimProofRequest);
    } catch (error) {
      console.error("Error initializing ReclaimProofRequest:", error);
    }
  }

  async function startVerificationSession() {
    if (!reclaimProofRequest) {
      console.error("ReclaimProofRequest not initialized");
      return;
    }

    try {
      // Generate the request URL for QR code
      const requestUrl = await reclaimProofRequest.getRequestUrl();
      setVerificationReqUrl(requestUrl);

      // Get the status URL for checking proof status
      const statusUrl = reclaimProofRequest.getStatusUrl();
      console.log("Status URL:", statusUrl);

      // Start the verification session
      await reclaimProofRequest.startSession({
        onSuccess: async (proof: Proof | string | undefined) => {
          if (proof && typeof proof === "string") {
            // When using a custom callback url, the proof is returned to the callback url and we get a message instead of a proof
            console.log("SDK Message:", proof);
            setExtracted(proof);
          } else if (proof && typeof proof !== "string") {
            // When using the default callback url, we get a proof
            console.log("Proof received:", proof?.claimData.context);
            setExtracted(JSON.stringify(proof?.claimData.context));
          }
        },
        onError: (error: Error) => {
          console.error("Error in proof generation:", error);
        },
      });
    } catch (error) {
      console.error("Error starting verification session:", error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl gap-2 w-full items-center justify-between font-mono text-sm lg:flex lg:flex-col lg:gap-10">
        <h1 className="text-2xl font-bold mb-4">Reclaim SDK Demo</h1>
        {!verificationReqUrl && (
          <button
            onClick={startVerificationSession}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Claim QR Code
          </button>
        )}
        {verificationReqUrl && (
          <div>
            <p className="mb-2">
              Scan this QR code to start the verification process:
            </p>
            <Link href={verificationReqUrl} target="_blank">
              <Canvas
                text={verificationReqUrl}
                options={{
                  errorCorrectionLevel: "M",
                  margin: 3,
                  scale: 4,
                  width: 200,
                  color: {
                    dark: "#000000ff",
                    light: "#ffffffff",
                  },
                }}
              />
            </Link>
          </div>
        )}
        {extracted && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Extracted Data:</h2>
            <pre className="bg-gray-100 p-4 rounded">{extracted}</pre>
          </div>
        )}
        {!extracted && verificationReqUrl && (
          <div className="mt-4">
            <p>Waiting for proof generation...</p>
            {/* Add a loading spinner here if desired */}
          </div>
        )}
      </div>
    </main>
  );
}