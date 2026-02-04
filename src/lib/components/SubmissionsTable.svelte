<script lang="ts">
    import SearchBar from "./SearchBar.svelte";
    import SubmissionRow from "./SubmissionRow.svelte";
    import PaginationInfo from "./PaginationInfo.svelte";
    import type { Submission, TableHeader, ModalCallback } from "$lib/types/admin";

    let {
        submissions = [],
        searchQuery = $bindable(""),
        openViewModal,
        openDeleteModal,
        headers = [],
    }: {
        submissions?: Submission[];
        searchQuery?: string;
        openViewModal: ModalCallback;
        openDeleteModal: ModalCallback;
        headers?: TableHeader[];
    } = $props();

    let sortColumn = $state("date");
    let sortDirection = $state<"asc" | "desc">("desc");

    function handleSort(column: string) {
        if (sortColumn === column) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = column;
            sortDirection = "asc";
        }
    }

    function getSortIcon(column: string) {
        if (sortColumn !== column) return "";
        return sortDirection === "asc"
            ? "bi-caret-up-fill"
            : "bi-caret-down-fill";
    }

    let filteredSubmissions = $derived.by(() => {
        const query = searchQuery.toLowerCase();
        const filtered = submissions.filter((s: Submission) => {
            const name = s.name || "";
            const sector = s.sector || "";
            const form = s.title || "";

            return (
                name.toLowerCase().includes(query) ||
                sector.toLowerCase().includes(query) ||
                form.toLowerCase().includes(query)
            );
        });

        return filtered.sort((a: Submission, b: Submission) => {
            const valA = (a[sortColumn as keyof Submission] as string | number) ?? "";
            const valB = (b[sortColumn as keyof Submission] as string | number) ?? "";

            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    });
</script>

<div class="admin-table-container">
    <div class="table-header">
        <h3 class="table-title">Formulários Preenchidos</h3>
        <SearchBar bind:searchQuery />
    </div>

    <table class="table table-hover">
        <thead>
            <tr>
                {#each headers as header}
                    <th
                        onclick={() => handleSort(header.column)}
                        role="button"
                        class={header.class || ""}
                    >
                        {header.label}
                        {#if getSortIcon(header.column)}
                            <i class="bi {getSortIcon(header.column)} sort-icon"
                            ></i>
                        {/if}
                    </th>
                {/each}
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            {#each filteredSubmissions as item}
                <SubmissionRow {item} {openViewModal} {openDeleteModal} />
            {/each}
        </tbody>
    </table>
    <PaginationInfo
        filteredCount={filteredSubmissions.length}
        totalCount={submissions.length}
    />
</div>

<style>
    .admin-table-container {
        background-color: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        margin-bottom: 40px;
    }

    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        flex-wrap: wrap;
        gap: 15px;
    }

    .table-title {
        color: var(--primary-color);
        font-weight: 600;
        font-size: 1.5rem;
        margin: 0;
    }

    table {
        width: 100% !important;
        border-collapse: separate;
        border-spacing: 0;
    }

    thead th {
        background-color: var(--light-bg);
        color: var(--primary-color);
        font-weight: 600;
        padding: 15px 10px;
        border-bottom: 2px solid var(--primary-color);
        position: relative;
    }

    thead th[role="button"] {
        cursor: pointer;
    }

    .sort-icon {
        margin-left: 5px;
        float: right;
    }

    .date-header {
        min-width: 165px;
    }

    .name-header {
        min-width: 100px;
    }
</style>
