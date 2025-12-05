const supabase = require('../src/lib/supabaseClient');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // Buscar perfil existente
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
        if (error && error.code !== "PGRST116") {
            console.error("Error cargando perfil:", error);
            return res.status(500).send("Error cargando perfil");
        }
        // Si no existe → lo creamos
        if (!profile) {
            const { data: newProfile, error: insertError } = await supabase
                .from("profiles")
                .insert({
                    id: userId,
                    email: null,
                    full_name: null,
                    avatar_url: null
                })
                .select()
                .maybeSingle();

            if (insertError) {
                console.error("Error creando perfil:", insertError);
                return res.status(500).send("No se pudo crear el perfil del usuario");
            }

            return res.render("profile/index", { profile: newProfile });
        }
        // Si existía → render normal
        res.render("profile/index", { profile });   
    } catch (error) {
        return res.status(500).send("Server Error");
    }
};
