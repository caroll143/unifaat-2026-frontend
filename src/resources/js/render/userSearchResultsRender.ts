import type { User } from "../types/api";

export default function userSearchResultsRender(
  users: User[],
  onSelect: (user: User) => void
): void {
  const container = document.querySelector<HTMLDivElement>(
    "#assign-search-results"
  );

  if (!container) return;

  container.replaceChildren();

  if (users.length === 0) {
    container.textContent = "Nenhum usuário encontrado.";
    return;
  }

  const list = document.createElement("div");
  list.classList.add("list-group");

  users.forEach((user) => {
    const item = document.createElement("div");
    item.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center",
      "gap-3"
    );

    const details = document.createElement("div");
    const name = document.createElement("strong");
    const email = document.createElement("div");
    const profile = document.createElement("small");

    name.textContent = user.name;
    email.textContent = user.email;
    profile.textContent = [
      user.job_title,
      [user.city, user.state].filter(Boolean).join("/"),
    ]
      .filter(Boolean)
      .join(" • ");

    details.append(name, email, profile);

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("btn", "btn-outline-primary", "btn-sm");
    button.textContent = "Escolher";

    button.addEventListener("click", () => {
      onSelect(user);
    });

    item.append(details, button);
    list.append(item);
  });

  container.append(list);
}