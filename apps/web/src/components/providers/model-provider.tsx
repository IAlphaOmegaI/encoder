"use client";
import { createContext, useContext, useEffect, useState } from "react";
// @ts-ignore, issues with onnxruntime-web
import * as ort from "onnxruntime-web";

interface ModelContextType {
  isModelReady: boolean;
  session: ort.InferenceSession | null;
  error: Error | null;
}

const ModelContext = createContext<ModelContextType>({
  isModelReady: false,
  session: null,
  error: null,
});

export const useModel = () => useContext(ModelContext);

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        // Configure ONNX Runtime
        ort.env.wasm.numThreads = 4;
        ort.env.wasm.simd = true;

        // Initialize session
        const session = await ort.InferenceSession.create(
          "/models/encodec_24khz.onnx",
          {
            executionProviders: ["wasm"],
            graphOptimizationLevel: "all",
          },
        );

        setSession(session);
        setIsModelReady(true);
      } catch (err) {
        console.error("Failed to initialize model:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to initialize model"),
        );
      }
    };

    initModel();
  }, []);

  return (
    <ModelContext.Provider value={{ isModelReady, session, error }}>
      {children}
    </ModelContext.Provider>
  );
};
