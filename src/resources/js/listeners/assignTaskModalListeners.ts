import { userSearchApi } from "../api/userSearchApi";
import { taskCreateApi } from "../api/taskCreateApi";
import userSearchResultsRender from "../render/userSearchResultsRender";
import tasksListRender from "../render/tasksListRender";
import type { User, UserSearchFilters } from "../types/api";

export default function assignTaskModalListeners(currentUserId: number): void {
  const searchField = document.querySelector<HTMLSelectElement>("#assign-search-field");
  const searchValue = document.querySelector<HTMLInputElement>("#assign-search-value");
  const searchButton = document.querySelector<HTMLButtonElement>("#assign-search-button");
  const taskNameInput = document.querySelector<HTMLInputElement>("#assign-task-name");
  const submitButton = document.querySelector<HTMLButtonElement>("#assign-task-submit");
  const resultsContainer = document.querySelector<HTMLDivElement>("#assign-search-results");
  const selectedContainer = document.querySelector<HTMLDivElement>("#assign-selected-user");
  const messageContainer = document.querySelector<HTMLDivElement>("#assign-task-message");
  const modalElement = document.querySelector<HTMLDivElement>("#assign-task-modal");

  if (
    !searchField ||
    !searchValue ||
    !searchButton ||
    !taskNameInput ||
    !submitButton ||
    !resultsContainer ||
    !selectedContainer ||
    !messageContainer ||
    !modalElement
  ) {
    return;
  }

  let selectedUser: User | null = null;

  const showMessage = (message: string, type = "danger"): void => {
    messageContainer.textContent = message;
    messageContainer.className = "alert alert-" + type + " mb-3";
  };

  const clearMessage = (): void => {
    messageContainer.textContent = "";
    messageContainer.className = "mb-3";
  };

  const searchUsers = async (): Promise<void> => {
    const value = searchValue.value.trim();
    resultsContainer.replaceChildren();
    clearMessage();

    if (!value) {
      showMessage("Digite um texto para buscar.", "warning");
      return;
    }

    const filters: UserSearchFilters = {};

    switch (searchField.value) {
      case "name":
        filters.name = value;
        break;
      case "email":
        filters.email = value;
        break;
      case "job_title":
        filters.job_title = value;
        break;
      case "city":
        filters.city = value;
        break;
      case "state":
        filters.state = value;
        break;
      case "bio":
        filters.bio = value;
        break;
      default:
        showMessage("Selecione um campo válido.", "warning");
        return;
    }

    try {
      const response = await userSearchApi(filters, 1, 10);

      userSearchResultsRender(response.data, (user) => {
        selectedUser = user;
        selectedContainer.textContent =
          "Atribuir para: " + user.name + " (" + user.email + ")";
        selectedContainer.classList.remove("d-none");
        clearMessage();
      });

      if (response.total > 0) {
        const count = document.createElement("p");
        count.className = "text-muted";
        count.textContent = String(response.total) + " usuário(s) encontrado(s)";
        resultsContainer.prepend(count);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      showMessage("Não foi possível buscar usuários. Tente novamente.");
    }
  };

  searchButton.addEventListener("click", () => {
    void searchUsers();
  });

  searchValue.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void searchUsers();
    }
  });

  submitButton.addEventListener("click", async () => {
    const name = taskNameInput.value.trim();
    clearMessage();

    if (!name) {
      showMessage("Digite o nome da tarefa.", "warning");
      return;
    }

    if (!selectedUser) {
      showMessage("Escolha um usuário antes de criar a tarefa.", "warning");
      return;
    }

    try {
      await taskCreateApi(selectedUser.id, { name });

      const assignedName = selectedUser.name;

      if (selectedUser.id === currentUserId) {
        await tasksListRender(currentUserId);
      }

      modalElement
        .querySelector<HTMLButtonElement>('button[data-bs-dismiss="modal"]')
        ?.click();

      taskNameInput.value = "";
      searchValue.value = "";
      searchField.value = "name";
      resultsContainer.replaceChildren();
      selectedContainer.replaceChildren();
      selectedContainer.classList.add("d-none");
      selectedUser = null;

      const pageMessage = document.createElement("div");
      pageMessage.className = "alert alert-success";
      pageMessage.textContent = "Tarefa criada para " + assignedName + ".";
      document.querySelector("main")?.prepend(pageMessage);

      window.setTimeout(() => pageMessage.remove(), 5000);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      showMessage("Não foi possível criar a tarefa. Tente novamente.");
    }
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    clearMessage();
  });
}