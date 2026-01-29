export async function getEnigmes() {
  const res = await fetch("https://web-production-5392.up.railway.app/api/enigmes/");
  if (!res.ok) throw new Error("Erreur API");
  return res.json();
}

export async function getEnigmeDetails(id) {
  const res = await fetch(`https://web-production-5392.up.railway.app/api/enigmes/${id}/`);
  if (!res.ok) throw new Error("Erreur API");
  return res.json();
}

