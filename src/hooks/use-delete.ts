"use client";

import { toast } from "sonner";
import { useCookie } from './use-cookie';

export function useDelete() {
  const { getCookie, setCookie } = useCookie();

  const handleDelete = async (fileId: string) => {
    const zdAgreed = localStorage.getItem("zd_agreed");
    if (!zdAgreed) {
      return;
    }

    let deletedFile: { name: string; id: string; date: string; starred?: boolean } | null = null;

    try {
      const uploadedFiles = getCookie('files');
      if (uploadedFiles) {
        const files: { name: string; id: string; date: string; starred?: boolean }[] = JSON.parse(uploadedFiles);
        const fileIndex = files.findIndex((file) => file.id === fileId);
        if (fileIndex !== -1) {
          deletedFile = files[fileIndex];
          const updatedFiles = files.filter((file) => file.id !== fileId);
          setCookie('files', JSON.stringify(updatedFiles));
        }
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('done-deleting'));
      }
      toast.success("Delete successful", {
        action: {
          label: "Undo",
          onClick: () => {
            if (deletedFile) {
              const uploadedFiles = getCookie('files');
              const files: { name: string; id: string; date: string; starred?: boolean }[] = uploadedFiles ? JSON.parse(uploadedFiles) : [];
              files.push(deletedFile);
              setCookie('files', JSON.stringify(files));
              window.dispatchEvent(new Event('done-deleting'));
            }
          },
        },
      });
    } catch {
      toast.error('Delete failed. Please try again.');
    }
  };

  return {
    handleDelete,
  };
}