"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function TermsDialog() {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return !localStorage.getItem("zd_agreed")
        }
        return true
    })
    const [isAgreed, setIsAgreed] = useState(() => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem("zd_agreed")
        }
        return false
    })

    const handleAgree = () => {
        const keyArray = new Uint8Array(32);
        crypto.getRandomValues(keyArray);
        const zdKey = Array.from(keyArray, byte => byte.toString(16).padStart(2, '0')).join('');

        localStorage.setItem("zd_agreed", "true")
        localStorage.setItem("zd_key", zdKey);
        setIsAgreed(true)
        setIsOpen(false)
    }

    if (isAgreed) {
        return null
    }

    return (
        <Dialog open={isOpen}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Notices and Terms</DialogTitle>
                    <DialogDescription>
                        Please be sure to agree to this before using our service.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto text-sm">
                    <p>All damages caused by the use of this service shall be the responsibility of the user, and the developer shall not be held liable in any way.
                        Files are uploaded encrypted, and only the user owns the encryption key.
                        Please note that if you lose the encryption key, you will never be able to decrypt your files again.
                        Do not use this service for storing important files.
                        Also, please refrain from uploading files that violate the law (e.g., child pornography, viruses/malware, entire anime series, full TV shows, depictions of cruel violence, sexual content involving minors).
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handleAgree}>
                        <Check />I understand and agree.
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}