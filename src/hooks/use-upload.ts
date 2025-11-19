"use client";

import { useRef } from 'react';
import { toast } from "sonner"
import { useCookie } from './use-cookie';

type FileItem = {
  name: string;
  date: string;
  id: string;
};

export function useUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getCookie, setCookie } = useCookie();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const zdAgreed = localStorage.getItem("zd_agreed");
    if (!zdAgreed) {
      return;
    }

    let zdKey = localStorage.getItem("zd_key");
    if (!zdKey) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      zdKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      localStorage.setItem("zd_key", zdKey);
    }

    const hexToUint8 = (hex: string) => new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const keyBytes = hexToUint8(zdKey);
    const cryptoKey = await crypto.subtle.importKey('raw', keyBytes.buffer, { name: 'AES-CBC' }, false, ['encrypt']);

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const plain = await file.arrayBuffer();
    const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, plain);
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.byteLength + encryptedBytes.byteLength);
    combined.set(iv, 0);
    combined.set(encryptedBytes, iv.byteLength);

    const encryptedBlob = new Blob([combined.buffer], { type: 'application/octet-stream' });

    const formData = new FormData();
    formData.append('file', encryptedBlob, file.name + '.enc');

    toast.promise(
      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      }).then(async (response) => {
        if (response.ok) {
          const result = await response.json();
          const uploadedFiles = getCookie('files');
          const files: FileItem[] = uploadedFiles ? JSON.parse(uploadedFiles) : [];
          const now = new Date();
          const pad = (value: number) => value.toString().padStart(2, '0');
          const formattedDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

          let finalName = file.name;
          let counter = 1;
          while (files.some((f: FileItem) => f.name === finalName)) {
            const nameParts = file.name.split('.');
            if (nameParts.length > 1) {
              const ext = nameParts.pop();
              const base = nameParts.join('.');
              finalName = `${base} (${counter}).${ext}`;
            } else {
              finalName = `${file.name}(${counter})`;
            }
            counter++;
          }

          files.push({ name: finalName, date: formattedDate, id: result.id });
          setCookie('files', JSON.stringify(files));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('done-uploading'));
          }
          return result;
        } else {
          throw new Error('Upload failed');
        }
      }),
      {
        loading: 'Uploading...',
        success: 'Upload successful',
        error: 'Upload failed. Please try again.',
      }
    );
  };

  return {
    fileInputRef,
    handleUploadClick,
    handleUpload,
  };
}