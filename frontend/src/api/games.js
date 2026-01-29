


export async function createGame(id) {
    const res = await fetch("https://web-production-5392.up.railway.app/api/enigmes/games/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enigme_id: id })
    });
    if (!res.ok) throw new Error("Game creation failed");
    return res.json();
}