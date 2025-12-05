const { supabase } = require("../src/services/supabase");

const Information = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener todos los reportes del usuario
        const { data: reports, error } = await supabase
            .from("reports")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        const totalReports = reports ? reports.length : 0;
        const latestReport = totalReports > 0 ? reports[0] : null;

        // Keys activas
        const { data: keys } = await supabase
            .from("api_keys")
            .select("*")
            .eq("user_id", userId)
            .eq("revoked", false);

        const totalApiKeys = keys ? keys.length : 0;

        res.render("dashboard/index", {
            user: req.user,
            totalReports,
            totalApiKeys,
            latestReport,
            recentReports: reports ? reports.slice(0, 5) : [],
        });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    Information,
};