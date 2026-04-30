const normalize = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export function formatBadgeLabel(value) {
  const key = normalize(value);
  if (key === "affecte") return "Affecte";
  if (key === "en reparation") return "En reparation";
  if (key === "restitue") return "Restitue";
  if (key === "transfere") return "Transfere";
  if (key === "effectue") return "Effectue";
  if (key === "endommage") return "Endommage";
  if (key === "usage") return "Usage";
  if (key === "en attente") return "En attente";
  if (key === "validee") return "Validee";
  if (key === "acceptee") return "Acceptee";
  if (key === "refusee") return "Refusee";
  if (key === "traitee") return "Traitee";
  return value ?? "-";
}

export function getBadgeClass(value) {
  const key = normalize(value);
  switch (key) {
    case "bon":
      return "badge-green";
    case "neuf":
      return "badge-light-green";
    case "endommage":
      return "badge-red";
    case "usage":
      return "badge-yellow";
    case "disponible":
      return "badge-green";
    case "affecte":
      return "badge-blue";
    case "en reparation":
      return "badge-red";
    case "restitue":
      return "badge-orange";
    case "transfere":
      return "badge-blue";
    case "effectue":
      return "badge-green";
    case "en attente":
      return "badge-orange";
    case "validee":
      return "badge-green";
    case "acceptee":
      return "badge-green";
    case "refusee":
      return "badge-red";
    case "traitee":
      return "badge-blue";
    case "faible":
      return "badge-urgence-faible";
    case "normal":
      return "badge-urgence-normal";
    case "urgent":
      return "badge-urgence-urgent";
    default:
      return "badge-default";
  }
}

export function getBadgeStyle(className) {
  switch (className) {
    case "badge-green":
      return { color: "#166534", backgroundColor: "#dcfce7" };
    case "badge-light-green":
      return { color: "#15803d", backgroundColor: "#ecfccb" };
    case "badge-red":
      return { color: "#b91c1c", backgroundColor: "#fee2e2" };
    case "badge-yellow":
      return { color: "#a16207", backgroundColor: "#fef9c3" };
    case "badge-blue":
      return { color: "#1d4ed8", backgroundColor: "#dbeafe" };
    case "badge-orange":
      return { color: "#c2410c", backgroundColor: "#ffedd5" };
    case "badge-gray":
      return { color: "#374151", backgroundColor: "#e5e7eb" };
    case "badge-urgence-faible":
      return { color: "#166534", backgroundColor: "#dcfce7" };
    case "badge-urgence-normal":
      return { color: "#a16207", backgroundColor: "#fef3c7" };
    case "badge-urgence-urgent":
      return { color: "#b91c1c", backgroundColor: "#fee2e2" };
    default:
      return { color: "#334155", backgroundColor: "#e2e8f0" };
  }
}

export function renderBadge(value) {
  const badgeClass = getBadgeClass(value);
  return (
    <span
      className={`badge ${badgeClass}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "999px",
        padding: "3px 9px",
        fontSize: "0.72rem",
        fontWeight: 700,
        lineHeight: 1.2,
        ...getBadgeStyle(badgeClass),
      }}
    >
      {formatBadgeLabel(value)}
    </span>
  );
}
