"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { toast } from "sonner";
import { ImageIcon, Upload, Loader2 } from "lucide-react";

interface ImageUploadModelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
}

export function ImageUploadModel({
  open,
  onOpenChange,
  onUploaded,
}: ImageUploadModelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card shadow-md">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Upload Image
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Drag & drop your image or click to browse files.
          </DialogDescription>
        </DialogHeader>

        <UploadDropzone
          endpoint="imageUploader"
          className="
            mt-4
            border-2 border-dashed border-border
            rounded-xl
            bg-muted/50
            p-8
            flex flex-col items-center justify-center text-center
            transition-all duration-300
            hover:bg-muted
            ut-uploading:opacity-80
            ut-uploading:cursor-wait
            ut-uploading:bg-muted/70
            ut-ready:border-primary/50
            ut-ready:shadow-sm
            ut-uploading:shadow-inner
            cursor-pointer
          "
          appearance={{
            container:
              "flex flex-col items-center justify-center gap-2 text-center",
            label:
              "text-sm text-muted-foreground font-medium flex items-center gap-2",
            allowedContent:
              "text-xs text-muted-foreground italic tracking-wide",
            button:
              "mt-3 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            uploadIcon: "text-muted-foreground size-6",
          }}
          content={{
            label({ ready }) {
              if (ready) {
                return (
                  <div className="flex flex-col items-center gap-2">
                    {/* <div className="bg-primary/10 p-3 rounded-full">
                      <ImageIcon className="size-6 text-primary" />
                    </div> */}
                    <p className="text-sm font-medium text-foreground">
                      Drop your image here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to select a file
                    </p>
                  </div>
                );
              }
              return (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  <p className="text-sm">Uploading your image...</p>
                </div>
              );
            },
          }}
          onClientUploadComplete={(res) => {
            const url = res[0].ufsUrl;
            toast.success("Image uploaded successfully!");
            onUploaded(url);
            onOpenChange(false);
          }}
          onUploadError={(error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
        />

        <p className="text-xs text-muted-foreground text-center mt-3">
          Supported formats: JPG, PNG, WEBP • Max size: 5MB
        </p>
      </DialogContent>
    </Dialog>
  );
}
