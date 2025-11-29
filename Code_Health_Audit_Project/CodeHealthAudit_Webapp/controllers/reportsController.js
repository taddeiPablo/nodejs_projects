// controllers/reportsController.js

//const supabase = require("../src/services/supabase");
const supabase = require('../src/lib/supabaseClient');

exports.createReport = async (req, res) => {
    try {
        const { projectPath, timestamp, summary, files } = req.body;

        const { data, error } = await supabase
            .from("reports")
            .insert({
                project_path: projectPath,
                processed_at: timestamp,
                summary,
                raw_files: files,
            })
            .select();

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: "DB error" });
        }

        return res.status(201).json({ success: true, report: data[0] });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
