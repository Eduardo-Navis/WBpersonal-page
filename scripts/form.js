document.documentElement.classList.add("is-ready");

const PERSONAL_WHATSAPP_LINK = "https://api.whatsapp.com/send/?phone=5517996120222";

const form = document.querySelector("#assessment-form");
const formLayout = document.querySelector(".form-layout");
const formIntro = document.querySelector(".form-intro");
const steps = [...document.querySelectorAll("[data-step]")];
const progressSteps = [...document.querySelectorAll("[data-progress-step]")];
const currentStepLabel = document.querySelector("#current-step");
const progressPercent = document.querySelector("#progress-percent");
const progressBar = document.querySelector("#progress-bar");
const result = document.querySelector("#form-result");
const messagePreview = document.querySelector("#message-preview");
const whatsappLink = document.querySelector("#whatsapp-link");
const copyButton = document.querySelector("#copy-message");
const downloadButton = document.querySelector("#download-file");
const editButton = document.querySelector("#edit-form");
const frequencyOptions = [...form.querySelectorAll("input[name='frequencia']")];
const otherFrequencyField = document.querySelector("#other-frequency-field");
const otherFrequencyInput = form.querySelector("input[name='frequencia_outro']");

let activeStep = 0;
let compiledMessage = "";

function showStep(index) {
  activeStep = Math.max(0, Math.min(index, steps.length - 1));

  steps.forEach((step, stepIndex) => {
    const isActive = stepIndex === activeStep;
    step.hidden = !isActive;
    step.classList.toggle("is-active", isActive);

    if (isActive) {
      step.classList.remove("is-entering");
      requestAnimationFrame(() => step.classList.add("is-entering"));
    }
  });

  progressSteps.forEach((item, itemIndex) => {
    item.classList.toggle("is-current", itemIndex === activeStep);
    item.classList.toggle("is-complete", itemIndex < activeStep);
  });

  const progress = Math.round(((activeStep + 1) / steps.length) * 100);
  currentStepLabel.textContent = String(activeStep + 1).padStart(2, "0");
  progressPercent.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;

  if (window.scrollY > formLayout.offsetTop - 80) {
    formLayout.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function validateStep(step) {
  let isValid = true;
  let firstInvalid = null;

  step.querySelectorAll("[data-required-group]").forEach((group) => {
    const hasSelection = [...group.querySelectorAll("input")].some((input) => input.checked);
    group.classList.toggle("is-invalid", !hasSelection);
    group.setAttribute("aria-invalid", String(!hasSelection));

    if (!hasSelection) {
      isValid = false;
      firstInvalid ||= group.querySelector("input");
    }
  });

  step.querySelectorAll("input[required], select[required], textarea[required]").forEach((field) => {
    const fieldIsValid = field.checkValidity();
    field.closest(".consent")?.classList.toggle("is-invalid", !fieldIsValid);

    if (!fieldIsValid) {
      isValid = false;
      firstInvalid ||= field;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: true });
    firstInvalid.closest(".field, .choice-group, .consent")?.scrollIntoView({ behavior: "smooth", block: "center" });

    if (firstInvalid.matches(":not([type='checkbox']):not([type='radio'])")) {
      firstInvalid.reportValidity();
    }
  }

  return isValid;
}

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    if (validateStep(steps[activeStep])) showStep(activeStep + 1);
  });
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => showStep(activeStep - 1));
});

document.querySelectorAll("[data-required-group] input").forEach((input) => {
  input.addEventListener("change", () => {
    input.closest("[data-required-group]")?.classList.remove("is-invalid");
  });
});

form.querySelector("input[name='consentimento']").addEventListener("change", (event) => {
  event.currentTarget.closest(".consent")?.classList.remove("is-invalid");
});

frequencyOptions.forEach((option) => {
  option.addEventListener("change", () => {
    const showOtherField = option.value === "Outro" && option.checked;
    otherFrequencyField.hidden = !showOtherField;
    otherFrequencyInput.required = showOtherField;

    if (showOtherField) {
      requestAnimationFrame(() => otherFrequencyInput.focus());
    } else {
      otherFrequencyInput.value = "";
    }
  });
});

const phoneInput = form.querySelector("input[name='telefone']");
phoneInput.addEventListener("input", () => {
  const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
  const parts = [];

  if (digits.length) parts.push(`(${digits.slice(0, 2)}`);
  if (digits.length >= 2) parts[0] += ") ";
  if (digits.length > 2) parts.push(digits.slice(2, 7));
  if (digits.length > 7) parts.push(`-${digits.slice(7)}`);

  phoneInput.value = parts.join("");
});

function answer(data, field, fallback = "Não informado") {
  return String(data.get(field) || "").trim() || fallback;
}

function listAnswer(data, field) {
  const values = data.getAll(field).filter(Boolean);
  return values.length ? values.join(", ") : "Não informado";
}

function compileAnswers() {
  const data = new FormData(form);
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date());
  const selectedFrequency = answer(data, "frequencia");
  const frequency = selectedFrequency === "Outro"
    ? `Outro — ${answer(data, "frequencia_outro")}`
    : selectedFrequency;

  return [
    "*NOVA AVALIAÇÃO — CONSULTORIA WASHINGTON BIANCHI*",
    `_${date}_`,
    "",
    "*SOBRE O ALUNO*",
    `Nome: ${answer(data, "nome")}`,
    `Idade: ${answer(data, "idade")}`,
    `WhatsApp: ${answer(data, "telefone")}`,
    `Cidade: ${answer(data, "cidade")}`,
    `Profissão: ${answer(data, "profissao")}`,
    "",
    "*OBJETIVOS E EXPERIÊNCIA*",
    `Objetivos: ${listAnswer(data, "objetivos")}`,
    `Experiência: ${answer(data, "experiencia")}`,
    `Treina atualmente: ${answer(data, "treina_atualmente")}`,
    "",
    "*SAÚDE E LIMITAÇÕES*",
    `Lesões, dores ou limitações: ${answer(data, "limitacoes", "Nenhuma informada")}`,
    `Condições ou recomendações médicas: ${answer(data, "saude", "Nenhuma informada")}`,
    "",
    "*ROTINA DE TREINO*",
    `Frequência desejada: ${frequency}`,
    `Dias disponíveis: ${listAnswer(data, "dias")}`,
    `Melhor período: ${answer(data, "periodo")}`,
    `Local preferido: ${answer(data, "local")}`,
    `Observações: ${answer(data, "observacoes", "Nenhuma")}`,
    "",
    "_Ficha preenchida pelo formulário de avaliação inicial._"
  ].join("\n");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateStep(steps[activeStep])) return;

  compiledMessage = compileAnswers();
  messagePreview.textContent = compiledMessage;

  const encodedMessage = encodeURIComponent(compiledMessage);
  whatsappLink.href = `${PERSONAL_WHATSAPP_LINK}&text=${encodedMessage}`;

  formIntro.hidden = true;
  formLayout.hidden = true;
  result.hidden = false;
  result.classList.add("is-visible");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(compiledMessage);
    copyButton.textContent = "Mensagem copiada ✓";
    setTimeout(() => { copyButton.textContent = "Copiar mensagem"; }, 2200);
  } catch {
    const temporaryField = document.createElement("textarea");
    temporaryField.value = compiledMessage;
    document.body.appendChild(temporaryField);
    temporaryField.select();
    document.execCommand("copy");
    temporaryField.remove();
  }
});

downloadButton.addEventListener("click", () => {
  const name = String(new FormData(form).get("nome") || "aluno")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
  const file = new Blob([compiledMessage], { type: "text/plain;charset=utf-8" });
  const fileUrl = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = fileUrl;
  link.download = `avaliacao-${name || "aluno"}.txt`;
  link.click();
  URL.revokeObjectURL(fileUrl);
});

editButton.addEventListener("click", () => {
  result.hidden = true;
  result.classList.remove("is-visible");
  formIntro.hidden = false;
  formLayout.hidden = false;
  showStep(2);
});

showStep(0);
