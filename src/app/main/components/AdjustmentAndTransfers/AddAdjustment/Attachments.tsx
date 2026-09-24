import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input
} from "cim-ui-components";
import { useRef, useState } from "react";
import { PaperclipIcon } from "../../../../icons/PaperClipIcon";
import { TrashIcon } from "../../../../icons/TrashIcon";

interface AttachmentsProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function Attachments({
  files,
  onFilesChange
}: AttachmentsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAttach = () => {
    if (selectedFile) {
      onFilesChange([...files, selectedFile]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = (fileToDelete: File) => {
    onFilesChange(files.filter((f) => f !== fileToDelete));
  };

  return (
    <div className="mt-2">
      <Accordion className="w-full border rounded-lg px-4">
        <AccordionItem value="attachments" className="border-none">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PaperclipIcon className="size-5" />
              </div>
              <span className="font-semibold">
                Attachments ({files.length})
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="space-y-4 pb-4 pt-2">
            <div className="flex items-center gap-2">
              <Input
                id="file-input"
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={!!selectedFile}
              >
                Choose File
              </Button>

              <Button
                type="button"
                onClick={handleAttach}
                disabled={!selectedFile}
              >
                Attach
              </Button>
            </div>

            {selectedFile && (
              <p className="text-sm text-muted-foreground truncate">
                Selected: {selectedFile.name}
              </p>
            )}

            {/* List of Attached Files */}
            <div className="grid gap-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-end bg-secondary/50 p-2 rounded-md"
                >
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => handleDelete(file)}
                  >
                    <TrashIcon className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
