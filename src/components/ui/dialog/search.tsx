import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { useCookie } from "@/hooks/use-cookie"
import { useGet } from "@/hooks/use-get"
import { useMemo } from "react"
import { CornerDownLeft } from "lucide-react"

type FileItem = {
    id: string;
    name: string;
    date: string;
    starred?: boolean;
    type?: string;
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { getCookie } = useCookie();
    const { handleDownload } = useGet();

    function formatExtensionLabel(name: string) {
        const ext = name.split('.').pop()?.toUpperCase();
        return ext ? `${ext} Files` : 'Unknown Files';
    }

    const files = useMemo(() => {
        const filesData = getCookie('files');
        if (!filesData) return [];
        try {
            return JSON.parse(filesData) as FileItem[];
        } catch {
            return [];
        }
    }, [getCookie]);

    const starredFiles = useMemo(() => files.filter((file) => file.starred), [files]);
    const allFiles = files;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-2 pb-3 gap-3 border shadow-2xl bg-sidebar-accent" showCloseButton={false}>
                <Command className="rounded-t-lg border p-1.5 md:min-w-[450px]">
                    <CommandInput placeholder="Type a search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Favorites">
                            {starredFiles.map((file) => (
                                <CommandItem key={file.id} onSelect={() => handleDownload({ id: file.id, name: file.name })}>
                                    <span className="truncate">{file.name} ({formatExtensionLabel(file.name)})</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Files">
                            {allFiles.map((file) => (
                                <CommandItem key={file.id} onSelect={() => handleDownload({ id: file.id, name: file.name })}>
                                    <span className="truncate">{file.name} ({formatExtensionLabel(file.name)})</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
                <div className="flex items-center px-0.5 text-sm text-muted-foreground gap-1">
                    <Kbd className="bg-white"><CornerDownLeft /></Kbd>Enter to download
                </div>
            </DialogContent>
        </Dialog>
    )
}
