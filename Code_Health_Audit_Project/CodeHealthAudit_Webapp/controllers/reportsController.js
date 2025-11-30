// controllers/reportsController.js

//const supabase = require("../src/services/supabase");
const supabase = require('../src/lib/supabaseClient');

exports.createReport = async (req, res) => {
    try {
        //const { projectPath, timestamp, summary, files, raw_report } = req.body;
        const { projectPath, timestamp, summary, files, raw_report } = req.body;
        const userId = req.user.id;
        console.log(projectPath, timestamp, summary, files, raw_report);
        if (!raw_report) {
        return res.status(400).json({ error: "raw_report is required" });
        }

        const { data, error } = await supabase
            .from("reports")
            .insert({
                user_id: userId,
                project_root: projectPath,
                processed_at: timestamp,
                summary,
                raw_report: raw_report,
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
