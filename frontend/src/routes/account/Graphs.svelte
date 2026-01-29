<script>
  import Dialog from "$lib/components/Dialog.svelte";
  import {toast} from "$lib/stores/toast.js";
  import {currentUser} from "$lib/stores/auth.js";

  let graphs = $state([]);

  let isLoadingGraphs = $state(false);
  let graphsError = $state("");
  let editingGraphId = $state(null);
  let editingName = $state("");
  let deletingGraphId = $state(null);
  let showGraphDeleteDialog = $state(false);
  let graphToDelete = $state(null);

  const startEdit = (graph) => {
    editingGraphId = graph.id;
    editingName = graph.name ?? "Untitled graph";
  };

  const cancelEdit = () => {
    editingGraphId = null;
    editingName = "";
  };

  const saveName = async (graphId) => {
    try {
      const response = await fetch(`/accounts/graphs/${graphId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({name: editingName})
      });
      if (!response.ok) {
        $toast = {type: "error", title: "Rename failed", subtitle: "Unable to update graph name."};
        return;
      }
      graphs = graphs.map((graph) => graph.id === graphId ? {...graph, name: editingName} : graph);
      $toast = {type: "success", title: "Name updated"};
      cancelEdit();
    } catch {
      $toast = {type: "error", title: "Rename failed", subtitle: "Network error."};
    }
  };

  const confirmDeleteGraph = (graph) => {
    graphToDelete = graph;
    showGraphDeleteDialog = true;
  };

  const deleteGraph = async () => {
    if (!graphToDelete) return;
    const graphId = graphToDelete.id;
    deletingGraphId = graphId;
    try {
      const response = await fetch(`/accounts/graphs/${graphId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        $toast = {type: "error", title: "Delete failed", subtitle: "Unable to delete graph."};
        return;
      }

      graphs = graphs.filter((graph) => graph.id !== graphId);
      $toast = {type: "success", title: "Graph deleted"};
    } catch {
      $toast = {type: "error", title: "Delete failed", subtitle: "Network error."};
    } finally {
      deletingGraphId = null;
      showGraphDeleteDialog = false;
      graphToDelete = null;
    }
  };

  const formatTimestamp = (value) => {
    if (!value) return "Updated recently";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Updated recently";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  };

  const loadGraphs = async () => {
    if (!$currentUser) {
      graphs = [];
      return;
    }
    isLoadingGraphs = true;
    graphsError = "";
    try {
      const response = await fetch("/accounts/graphs", {credentials: "include"});
      if (!response.ok) {
        graphsError = "Unable to load graphs.";
        return;
      }
      const payload = await response.json().catch(() => ({}));
      graphs = payload.graphs ?? [];
    } catch {
      graphsError = "Unable to load graphs.";
    } finally {
      isLoadingGraphs = false;
    }
  };

  loadGraphs();
</script>


<div class="graph-list">
  {#if isLoadingGraphs}
    <div class="graph-empty">Loading your graphs...</div>
  {:else if graphsError}
    <div class="graph-empty">{graphsError}</div>
  {:else if graphs.length === 0}
    <div class="graph-empty">No graphs saved yet.</div>
  {:else}
    {#each graphs as graph}
      <div class="graph-row">
        <div class="graph-name">
          {#if editingGraphId === graph.id}
            <input class="graph-input" type="text" bind:value={editingName}/>
          {:else}
            {graph.name ?? "Untitled graph"}
          {/if}
        </div>
        <div class="graph-meta">
          <span class="graph-time">{formatTimestamp(graph.updated_at)}</span>
          {#if editingGraphId === graph.id}
            <button class="ghost-button" type="button" onclick={() => saveName(graph.id)}>Save</button>
            <button class="ghost-button" type="button" onclick={cancelEdit}>Cancel</button>
          {:else}
            <a class="ghost-button" href={"/?og=" + graph.id}>Open</a>
            <button class="ghost-button" type="button" onclick={() => startEdit(graph)}>Edit</button>
            <button
              class="ghost-button ghost-button--danger"
              type="button"
              onclick={() => confirmDeleteGraph(graph)}
              disabled={deletingGraphId === graph.id}
            >
              {deletingGraphId === graph.id ? "Deleting..." : "Delete"}
            </button>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<Dialog bind:showDialog={showGraphDeleteDialog}
        confirmText="Delete Graph"
        onConfirm={deleteGraph}
        title="Delete Graph"
        subtitle={`Delete ${graphToDelete?.name ?? "this graph"}? This cannot be undone.`}/>

<style>
  .graph-list {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .graph-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(65, 71, 92, 0.6);
    background: rgba(14, 18, 22, 0.6);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .graph-row:hover {
    border-color: rgba(65, 71, 92, 0.9);
    background: rgba(20, 26, 34, 0.8);
  }

  .graph-name {
    font-weight: 600;
  }

  .graph-meta {
    color: rgba(225, 232, 235, 0.6);
    font-size: 0.85em;
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .graph-time {
    color: rgba(225, 232, 235, 0.55);
    font-size: 0.85em;
  }

  .graph-empty {
    padding: 12px;
    border-radius: 12px;
    border: 1px dashed rgba(65, 71, 92, 0.6);
    color: rgba(225, 232, 235, 0.6);
    font-size: 0.9em;
  }

  .graph-input {
    width: 100%;
    max-width: 320px;
    background: transparent;
    border: 1px solid rgba(65, 71, 92, 0.7);
    border-radius: 8px;
    color: white;
    padding: 4px 8px;
  }
</style>