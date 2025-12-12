const supabase = require('../src/lib/supabaseClient');

exports.getProfile = async (req, res) => {
    try {
        /*const userId = req.user.id;
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
        profile.email = req.user.email;
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
        res.render("profile/index", { profile });*/
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) throw error;

        // Si el perfil no existe, lo creamos vacío
        let profile = data;
        if (!profile) {
            const { data: newProfile, error: insertErr } = await supabase
                .from("profiles")
                .insert({
                    id: userId,
                    email: req.user.email || null,
                    bio: "",
                    avatar_url: null
                })
                .select()
                .single();

            if (insertErr) throw insertErr;
                profile = newProfile;
        }

        // -------------------------------------------
        // Generar signed URL si existe avatar
        // -------------------------------------------
        let avatarUrl = null;

        if (profile.avatar_url) {
            const { data: signed, error: signedErr } = await supabase.storage
                .from("avatars")
                .createSignedUrl(profile.avatar_url, 60 * 60); // 1 hora

            if (!signedErr) {
                avatarUrl = signed.signedUrl;
            }
        }

        // Mezclamos email para mostrarlo
        profile.email = req.user.email || null;

        res.render("profile/index", {
            profile,
            avatarUrl,
        });
    } catch (error) {
        return res.status(500).send("Server Error");
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;

        let avatarPath = null;

        if (req.file) {
        const buffer = req.file.buffer;
        const fileExt = req.file.originalname.split(".").pop();
        const fileName = `${Date.now()}_${req.file.originalname}`;

        // EJ: avatars/<userId>/<fileName>
        avatarPath = `${userId}/${fileName}`;

        const { error: uploadErr } = await supabase.storage
                .from("avatars")
                .upload(avatarPath, buffer, {
                contentType: req.file.mimetype,
                upsert: true,
            });

            if (uploadErr) {
                console.error("Upload error:", uploadErr);
                return res.status(500).send("Error subiendo el avatar.");
            }
        }

        const updatePayload = {
            bio: bio || "",
        };

        if (avatarPath) {
            updatePayload.avatar_url = avatarPath; // 🔥 guardamos solo el path interno
        }

        const { error: updateErr } = await supabase
            .from("profiles")
            .update(updatePayload)
            .eq("id", userId);

        if (updateErr) {
            console.error("Update error:", updateErr);
            return res.status(500).send("No se pudo actualizar el perfil.");
        }

        res.redirect("/profile");
    } catch (error) {
        console.error("updateProfile error:", err);
        res.status(500).send("Error interno del servidor");
    }
};
