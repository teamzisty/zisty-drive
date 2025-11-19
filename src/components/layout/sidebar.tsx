"use client";

import { FolderOpen, CloudUpload, Files, Heart, Search, Settings } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label"
import { useUpload } from "@/hooks/use-upload";
import { usePathname } from "next/navigation";
import { SearchDialog } from "@/components/ui/dialog/search";
import { SettingsDialog } from "@/components/ui/dialog/setting";
import { useState } from "react";

export function AppSidebar() {
    const { fileInputRef, handleUploadClick, handleUpload } = useUpload();
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);

    return (
        <Sidebar>
            <SidebarHeader className="mt-1 pb-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center justify-between data-[slot=sidebar-menu-button]:p-1.5!">
                        <div className="flex pl-1.5 items-center gap-2">
                            <FolderOpen className="size-5!" />
                            <span className="text-base font-semibold">Drive</span>
                        </div>
                        {/* <SidebarTrigger /> */}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex items-center gap-2" key="upload">
                                <SidebarMenuButton className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear" onClick={handleUploadClick}>
                                    <CloudUpload />
                                    <span>Upload</span>
                                </SidebarMenuButton>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleUpload}
                                    style={{ display: 'none' }}
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem key="main">
                                <SidebarMenuButton asChild className={pathname === "/files" ? "bg-sidebar-accent" : ""}>
                                    <a href="/files">
                                        <Files />
                                        <span>Files</span>
                                    </a>
                                </SidebarMenuButton>
                                <SidebarMenuButton asChild className={pathname === "/favorites" ? "bg-sidebar-accent" : ""}>
                                    <a href="/favorites">
                                        <Heart />
                                        <span>Favorites</span>
                                    </a>
                                </SidebarMenuButton>
                                <SidebarMenuButton className="cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                                    <Search />
                                    <span>Search</span>
                                </SidebarMenuButton>
                                <SidebarMenuButton className="cursor-pointer" onClick={() => setIsSettingOpen(true)}>
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="mb-1 p-2">
                <SidebarMenuItem className="flex items-center gap-2" key="upload">
                    <SidebarMenuButton asChild>
                        <a href="https://discord.gg/6BPfVm6cST" target="_blank" rel="noopener noreferrer">
                            <SiDiscord />
                            <span>Discord</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenu className="px-2">
                    <Label className="mt-1.5 text-xs text-neutral-400">© Zisty (Rion)</Label>
                </SidebarMenu>
            </SidebarFooter>
            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
            <SettingsDialog open={isSettingOpen} onOpenChange={setIsSettingOpen} />
        </Sidebar>
    )
}