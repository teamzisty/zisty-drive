"use client";

import { toast } from "sonner"

export function useGet() {
  const handleDownload = async (file: { id: string; name: string }) => {
    toast.promise(
      (async () => {
        if (!file) return;

        const zdAgreed = localStorage.getItem("zd_agreed");
        if (!zdAgreed) {
          return;
        }

        const formData = new FormData();
        formData.append('id', file.id);
        formData.append('filename', file.name);

        const response = await fetch('/api/get', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const encryptedBlob = await response.blob();
        const encryptedBuffer = await encryptedBlob.arrayBuffer();
        const encryptedBytes = new Uint8Array(encryptedBuffer);

        const iv = encryptedBytes.slice(0, 16);
        const ciphertext = encryptedBytes.slice(16);

        const zdKey = localStorage.getItem('zd_key');
        if (!zdKey) {
          throw new Error('Key not found');
        }

        const hexToUint8 = (hex: string) => new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const keyBytes = hexToUint8(zdKey);

        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyBytes.buffer,
          { name: 'AES-CBC' },
          false,
          ['decrypt']
        );

        let decryptedBuffer: ArrayBuffer;
        try {
          decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, ciphertext);
        } catch {
          throw new Error('Decryption failed. The key may be different.');
        }

        const decryptedBlob = new Blob([decryptedBuffer]);

        const url = URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);

        return { success: true };
      })(),
      {
        loading: 'Downloading...',
        success: 'Download successful',
        error: (err) => err.message,
      }
    );
  };

  return {
    handleDownload,
  };
}