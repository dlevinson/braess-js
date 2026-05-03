export function populateSelect(select, options, selectedValue) {
  select.innerHTML = options
    .map(
      (option) =>
        `<option value="${option.value}" ${String(option.value) === String(selectedValue) ? "selected" : ""}>${option.label}</option>`,
    )
    .join("");
}

export function writeFormValues(elements, state) {
  elements.fieldInputs.forEach((input) => {
    const key = input.dataset.field;
    const value = key === "viewScenario" ? state.viewScenario : state.inputs[key];
    if (value !== undefined) {
      input.value = String(value);
    }
  });

  elements.sweepInputs.forEach((input) => {
    const key = input.dataset.sweep;
    const value = state.sweep[key];
    if (value !== undefined) {
      input.value = String(value);
    }
  });

  elements.elasticMapInputs.forEach((input) => {
    const key = input.dataset.elasticMap;
    const value = state.elasticMap[key];
    if (value !== undefined) {
      input.value = String(value);
    }
  });
}

export function readFormValues(elements) {
  const inputs = {};
  elements.fieldInputs.forEach((input) => {
    inputs[input.dataset.field] = input.value;
  });

  const sweep = {};
  elements.sweepInputs.forEach((input) => {
    sweep[input.dataset.sweep] = input.value;
  });

  const elasticMap = {};
  elements.elasticMapInputs.forEach((input) => {
    elasticMap[input.dataset.elasticMap] = input.value;
  });

  return {
    inputs,
    sweep,
    elasticMap,
  };
}

export function bindControls(elements, handlers) {
  elements.actions.forEach((button) => {
    button.addEventListener("click", () => {
      handlers[button.dataset.action]?.();
    });
  });
}
