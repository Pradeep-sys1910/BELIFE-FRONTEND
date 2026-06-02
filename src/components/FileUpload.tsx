'use client';

import { useRef, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  onUpload: (url: string) => void;
  accept?: 'image' | 'video' | 'both';
  label?: string;
  currentUrl?: string;
}

const LIMITS = { image: 10, video: 60 };

export default function FileUpload({ onUpload, accept = 'both', label = 'Upload File', currentUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const acceptAttr = accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*';

  const handleFile = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Only images and videos are allowed.');
      return;
    }

    const limitMB = isImage ? LIMITS.image : LIMITS.video;
    const sizeMB = file.size / 1024 / 1024;

    if (sizeMB > limitMB) {
      toast.error(`${isImage ? 'Image' : 'Video'} too large! Maximum is ${limitMB}MB. Your file is ${sizeMB.toFixed(1)}MB.`);
      return;
    }

    setUploading(true);
    setProgress(0);

    let reservedKey: string | null = null;
    try {
      // Step 1: Get presigned URL from backend (this reserves storage quota)
      const { data } = await api.post('/upload/presign', {
        mimeType: file.type,
        fileSize: file.size,
      });
      reservedKey = data.key;

      // Step 2: Upload directly to R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error('Upload failed'));
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', data.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      reservedKey = null; // upload succeeded — keep the reserved quota
      onUpload(data.publicUrl);
      toast.success('Uploaded successfully! 🌿');
    } catch (err: any) {
      // Release the reserved storage quota if the upload never completed
      if (reservedKey) {
        api.post('/upload/release', { key: reservedKey, fileSize: file.size }).catch(() => {});
      }
      toast.error(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
        style={{
          borderColor: uploading ? 'var(--border-eco)' : 'var(--input-border)',
          background:  uploading ? 'var(--eco-dim)' : 'var(--input-bg)',
          cursor:      uploading ? 'wait' : 'pointer',
        }}
        onMouseEnter={(e) => { if (!uploading) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-eco)';
          (e.currentTarget as HTMLElement).style.background  = 'var(--bg-hover)';
        }}}
        onMouseLeave={(e) => { if (!uploading) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)';
          (e.currentTarget as HTMLElement).style.background  = 'var(--input-bg)';
        }}}
      >
        <input ref={inputRef} type="file" accept={acceptAttr} onChange={handleChange} className="hidden" />

        {uploading ? (
          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--eco-bright)' }}>Uploading... {progress}%</p>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-elevated)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--eco)' }} />
            </div>
          </div>
        ) : currentUrl ? (
          <div>
            {currentUrl.match(/\.(mp4|webm|mov)$/i) ? (
              <video src={currentUrl} className="max-h-40 mx-auto rounded-lg mb-2" controls />
            ) : (
              <img src={currentUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-2 object-cover" />
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click or drag to replace</p>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {accept === 'image' && 'Images up to 10MB (JPEG, PNG, WebP, GIF)'}
              {accept === 'video' && 'Videos up to 60MB (MP4, WebM, MOV)'}
              {accept === 'both' && 'Images up to 10MB · Videos up to 60MB'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Click or drag &amp; drop</p>
          </div>
        )}
      </div>
    </div>
  );
}
