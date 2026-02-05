import {
    FileText,
    ClipboardList,
    BarChart3,
    Building,
    Users,
    Settings,
    ShieldCheck,
    HelpCircle,
    ArrowRight
} from 'lucide-svelte';

export const IconMap: Record<string, any> = {
    'bi-file-earmark-text': FileText,
    'bi-clipboard-check': ClipboardList,
    'bi-bar-chart-fill': BarChart3,
    'bi-building': Building,
    'bi-people': Users,
    'bi-gear': Settings,
    'bi-shield-check': ShieldCheck,
    'bi-question-circle': HelpCircle,
    'bi-arrow-right': ArrowRight,
    // Add more mappings as needed
};

export function getIcon(name: string) {
    return IconMap[name] || FileText;
}
