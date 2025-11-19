'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Star, CloudDownload, Trash2 } from 'lucide-react'
import { useCookie } from '@/hooks/use-cookie'
import { useDelete } from '@/hooks/use-delete'
import { useGet } from '@/hooks/use-get'

type FileItem = {
  id: string
  name: string
  fileType?: 'document' | 'image' | 'spreadsheet'
  data: string
  size?: string
  starred?: boolean
}

function formatExtensionLabel(name: string) {
  const ext = name.split('.').pop()?.toUpperCase();
  return ext ? `${ext} Files` : 'Unknown Files';
}

export default function FavoritesBrowser() {
  const [sort, setSort] = useState("latest")
  const { getCookie, setCookie } = useCookie();
  const { handleDelete: deleteFile } = useDelete();
  const { handleDownload: downloadFile } = useGet();

  const getStoredFiles = useCallback(() => {
    const files = getCookie('files');
    if (!files) return [];
    try {
      const parsedFiles = JSON.parse(files);
      return parsedFiles.map((file: { name: string; id: string; date: string; starred?: boolean }) => ({
        id: file.id,
        name: file.name,
        fileType: formatExtensionLabel(file.name),
        data: file.date,
        starred: file.starred || false,
      }));
    } catch {
      return [];
    }
  }, [getCookie]);

  const [storedFiles, setStoredFiles] = useState<FileItem[]>(getStoredFiles);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refreshFiles = () => {
      setStoredFiles(getStoredFiles());
    };
    window.addEventListener('done-uploading', refreshFiles);
    window.addEventListener('done-deleting', refreshFiles);
    return () => {
      window.removeEventListener('done-uploading', refreshFiles);
      window.removeEventListener('done-deleting', refreshFiles);
    };
  }, [getStoredFiles]);

  const sortedFiles = useMemo<FileItem[]>(() => {
    const filesCopy = [...storedFiles].filter(file => file.starred);
    switch (sort) {
      case 'name':
        return filesCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return filesCopy.sort((a, b) => {
          const typeCompare = (a.fileType || '').localeCompare(b.fileType || '');
          if (typeCompare !== 0) return typeCompare;
          return a.name.localeCompare(b.name);
        });
      case 'latest':
      default:
        return filesCopy.sort((a, b) => {
          const dateA = new Date(a.data).getTime();
          const dateB = new Date(b.data).getTime();
          return dateB - dateA;
        });
    }
  }, [storedFiles, sort]);

  const updateCookie = (updatedFiles: FileItem[]) => {
    const cookieData = updatedFiles.map(file => ({
      name: file.name,
      id: file.id,
      date: file.data,
      starred: file.starred,
    }));
    setCookie('files', JSON.stringify(cookieData));
  };

  const toggleStar = (id: string) => {
    setStoredFiles(prevFiles => {
      const updatedFiles = prevFiles.map(file =>
        file.id === id ? { ...file, starred: !file.starred } : file
      );
      updateCookie(updatedFiles);
      return updatedFiles;
    });
  }

  const handleDownload = async (file: FileItem) => {
    downloadFile(file);
  }

  const handleDelete = async (file: FileItem) => {
    deleteFile(file.id);
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center border-b border-border bg-card px-3 py-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Sort
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Sort Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="latest">Latest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="type">Type</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <table className="w-full">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
          </tr>
        </thead>
        <tbody>
          {sortedFiles.map((item) => (
            <tr
              key={item.id}
              className="group border-b border-border hover:bg-accent transition-colors"
            >
              <td className="px-6 py-4 max-w-55">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-muted-foreground">{item.data}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-muted-foreground">{item.fileType}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStar(item.id)
                    }}
                  >
                    <Star className={`h-4 w-4 ${item.starred ? 'fill-primary text-primary' : ''}`} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                  >
                    <CloudDownload className={`h-4 w-4`} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                  >
                    <Trash2 className={`h-4 w-4`} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}