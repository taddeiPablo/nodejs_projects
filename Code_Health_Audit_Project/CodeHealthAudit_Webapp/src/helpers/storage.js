// src/utils/storage.js
const { supabase } = require("../services/supabase");

async function getSignedUrl(path, expiresIn = 60 * 60) { // 1 hora
    if (!path) return null;

    const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, expiresIn);

    if (error) {
        console.error("Error creando signed URL:", error);
        return null;
    }

    return data.signedUrl;
}

module.exports = { getSignedUrl };
