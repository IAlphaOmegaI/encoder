"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@zenncore/ui/components/form";
import { Button } from "@zenncore/ui/components/button";
import { FileUpload } from "@zenncore/ui/components/file-upload";
import { useCollectionMutation } from "@/hooks";
import { uploadRecording } from "@/server/recordings";
import { toast } from "sonner";
import { parseAsInteger, useQueryState } from "nuqs";
import { FileMusicIcon } from "lucide-react";
import { useEffect, useRef, useTransition, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { getDuration } from "@/lib/audio/metadata";
import { useRouter } from "next/navigation";
import { useModel } from "./providers/model-provider";
import { processAudio } from "@/lib/audio/process";
import { EncodecProcessor } from "@/lib/audio/encodec";

const schema = z.object({
  recording: z.array(z.instanceof(File)).nonempty("Upload a recording"),
});

export const RecordingsForm = () => {
  const router = useRouter();
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(20));

  const [isPending, startTransition] = useTransition();
  const ffmpeg = useRef(new FFmpeg());
  const { isModelReady, error: modelError } = useModel();
  const [processingState, setProcessingState] = useState<string>("idle");
  const [encodecProcessor] = useState(() => new EncodecProcessor());

  const initializeFFmpeg = async () => {
    const src = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    ffmpeg.current.load({
      coreURL: await toBlobURL(`${src}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${src}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpeg.current.on("log", console.log);
  };

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const mutate = useCollectionMutation({
    // doing this only so we have on context the duration and other data
    createFn: (context: {
      data: FormData;
      duration: number;
      filename: string;
    }) => {
      return uploadRecording(context.data);
    },
    queryKey: ["recordings", { page: 1, limit }],
    strategies: {
      handleCreate: ({ filename, duration }, context) => {
        const now = Date.now();
        return {
          id: (context.length + 1).toString(),
          duration,
          filename,
          created_at: now,
          updated_at: now,
        };
      },
    },
  });

  const handleProcessing = async (file: File) => {
    if (!isModelReady) {
      toast.error("EnCodec model not ready. Please try again.");
      return;
    }

    try {
      const { encoded, metadata } = await processAudio(
        ffmpeg.current,
        file,
        encodecProcessor,
      );

      // Create FormData with encoded 8xN matrix
      const formData = new FormData();

      // Convert encoded data to binary
      const encodedBlob = new Blob([encoded.buffer], {
        type: "application/octet-stream",
      });

      formData.append("file", new File([encodedBlob], "encoded.bin"));
      formData.append("format", "encodec");
      formData.append("sample_rate", "24000");
      formData.append("duration", metadata.duration.toString());
      formData.append("original_filename", file.name);

      mutate({
        action: "create",
        data: {
          data: formData,
          duration: metadata.duration,
          filename: file.name,
        },
      });
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process audio");
    }
  };

  const handleSubmit = async (fields: z.infer<typeof schema>) => {
    // router.back();
    toast.promise(handleProcessing(fields.recording[0]), {
      loading: "Uploading...",
      success: () => "Recording uploaded successfully",
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: used on mount only
  useEffect(() => {
    startTransition(async () => {
      await initializeFFmpeg();
      await encodecProcessor.initialize();
    });
  }, []);

  if (isPending) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Debug info */}
      <div className="p-4 bg-gray-100 rounded-lg text-sm">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <div>Model Ready: {isModelReady ? "✅" : "❌"}</div>
        <div>Processing State: {processingState}</div>
        {modelError && (
          <div className="text-red-500">Model Error: {modelError.message}</div>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="recording"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recording</FormLabel>
                <FormControl>
                  <FileUpload
                    {...field}
                    multiple={false}
                    accept={{
                      "audio/*": ["mp3", "wav", "flac"],
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload a WAV file (24kHz sample rate recommended)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {processingState !== "idle" && (
                <span>
                  {processingState === "processing" && "⏳ Processing..."}
                  {processingState === "success" && "✅ Processing complete"}
                  {processingState === "error" && "❌ Processing failed"}
                </span>
              )}
            </div>
            <Button type="submit" disabled={processingState === "processing"}>
              <FileMusicIcon strokeWidth={1.5} className="mr-2" />
              Submit new Recording
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
