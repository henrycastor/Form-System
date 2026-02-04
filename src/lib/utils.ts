import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date | undefined): string {
    if (!date) return "N/A";

    let d: Date;
    if (typeof date === "string") {
        // SQLite format is "YYYY-MM-DD HH:MM:SS" which is UTC
        // Ensure it's treated as UTC by appending 'Z' if no timezone is present
        let cleanDate = date;
        if (!date.includes('T') && !date.includes('Z')) {
            cleanDate = date.replace(' ', 'T') + 'Z';
        } else if (date.includes('T') && !date.includes('Z') && !date.includes('+') && date.lastIndexOf('-') < 11) {
            // Checks if it's "YYYY-MM-DDTHH:MM:SS" without offset
            cleanDate = date + 'Z';
        }
        d = new Date(cleanDate);
    } else if (typeof date === "number") {
        d = new Date(date);
    } else {
        d = date;
    }

    if (isNaN(d.getTime())) return String(date);

    return d.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
