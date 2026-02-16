import { useState } from "react";
import { uploadFile } from "../lib/api";
import { useToast } from "./ToastProvider";

interface UploadInputProps {
  label: string;
  accept: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function UploadInput({ label, accept, urls, onChange }: UploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const { pushToast } = useToast();

  const onFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        uploaded.push(url);
      }
      onChange([...urls, ...uploaded]);
      pushToast(`${uploaded.length} file(s) uploaded`, "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <input
        type="file"
        accept={accept}
        multiple
        disabled={uploading}
        onChange={(event) => onFilesPicked(event.target.files)}
      />
      {uploading && <p className="muted">Uploading...</p>}
      {urls.length > 0 && (
        <div className="chip-list">
          {urls.map((url) => (
            <div className="chip-row" key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="chip-link">
                {url}
              </a>
              <button
                type="button"
                className="btn btn-small"
                onClick={() => onChange(urls.filter((item) => item !== url))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
