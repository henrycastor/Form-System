import type { Component } from "svelte";

export type StatKey = "total" | "pending" | "completed" | "recent";

export interface StatConfigItem {
	key: StatKey;
	icon: any;
	label: string;
	color: string;
}

export interface SubmissionStats {
	total: number;
	pending: number;
	completed: number;
	recent: number;
}

export interface TableHeader {
	column: string;
	label: string;
	class?: string;
}

/**
 * Submission form data
 */
export interface Submission {
	id?: string | number;
	name: string;
	title: string;
	date?: string | number;
	submitted_at?: string | number;
	status: "completed" | "pending";
	data?: Record<string, unknown>;
	details?: Record<string, unknown>;
}

/**
 * Modal callback function type - accepts optional argument
 */
export type ModalCallback = (arg?: any) => void;
