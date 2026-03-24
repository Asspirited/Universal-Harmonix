// Universal Harmonix — GFZ Potsdam Kp API client (I/O boundary)
// UH-033

export async function kpClient(isoString) {
  const date = isoString.slice(0, 10);
  const url  = `https://kp.gfz-potsdam.de/app/json/?start=${date}T00:00:00Z&end=${date}T23:59:59Z&index=Kp&status=def`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Kp API ${res.status}: ${url}`);
  return res.json();
}
