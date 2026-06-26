'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from 'lucide-react';

export default function UploadDropzone({ onFilesSelected }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      onFilesSelected?.(acceptedFiles);
      setIsDragging(false);
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-3xl border border-dashed px-4 py-6 text-center transition ${
        isDragging ? 'border-primary bg-slate-900/50' : 'border-border bg-[#111827]'
      }`}
    >
      <input {...getInputProps()} />
      <CloudUpload className="mx-auto mb-3 h-6 w-6 text-primary" />
      <p className="text-sm text-muted">Drag files here to attach, or use the attach button.</p>
    </div>
  );
}
