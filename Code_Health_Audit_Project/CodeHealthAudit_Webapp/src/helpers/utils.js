//===================================
// ============ HELPERS =============
//===================================

function getRepoName(path) {
    if (!path) return "N/A";
    const parts = path.split(/[/\\]+/);
    return parts[parts.length - 1];
}

function getFileName(path) {
    if (!path) return "Archivo";
    const parts = path.split(/[/\\]+/);
    return parts[parts.length - 1];
}

function formatDate(iso) {
    if (!iso) return "N/A";
    try {
        const d = new Date(iso);
        return d.toLocaleString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
        });
    } catch {
        return iso;
    }
}

module.exports = {
    getRepoName,
    getFileName,
    formatDate
}