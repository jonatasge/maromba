/* ARRAY HELPERS */
function sumArr(arr) {
  return arr.reduce((r, n) => r + n, 0);
}

function removeDuplicates(arr) {
  if (!arr?.length) return;

  const seen = new Set();

  return arr.filter((subArray) => {
    const key = JSON.stringify(subArray);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* VARS */
const state = new Proxy(
  {},
  {
    set(target, key, value) {
      target[key] = value;

      switch (key) {
        case "weights":
          state.combinations = {
            halter: getCombinations(state.weights),
            barra: Object.entries(
              getCombinations(state.weights.flatMap((n) => [n, n]))
            ).reduce((r, [w, c]) => ({ ...r, [w]: removeDuplicates(c) }), {}),
          };

          if (state.type) handleLoads();
          break;

        case "type":
          handleCombinations();
          handleLoads();
          break;

        case "load":
          handleCombinations();
          break;
      }

      localStorage.setItem("state", JSON.stringify(state));
    },
  }
);

const emptyOption = `<option value="">Selecione</option>`;

/* EVENTS HANDLER */
function onWeightsChange(event) {
  state.weights = event.target.value
    .split(",")
    .map(Number)
    .filter((v) => v);
}

function onTypeChange(event) {
  state.type = event.target.value;
}

function onLoadChange(event) {
  state.load = event.target.value;
}

function onCombinationChange(event) {
  state.combination = event.target.value
  const weights = state.combination.split("+").map(Number);
  printPreview({ type: state.type, weights });
}

/* METHODS */
function handleLoads() {
  state.load = "";
  if (!state.type) return (state.load = "");
  if (!state.combinations) return;

  const field = document.getElementById("load");
  const loads = Object.keys(state.combinations[state.type]).map((c) => c * 2);
  state.loads = loads;

  field.innerHTML =
    emptyOption +
    loads.map((load) => `<option value="${load}">${load}kg</option>`).join("");
}

function handleCombinations() {
  const field = document.getElementById("combination");

  if (!state.load) return (field.innerHTML = "");
  if (!state.type || !state.load) return;

  const weight = parseInt(state.load) / 2;
  const combinations = state.combinations[state.type][weight];

  field.innerHTML =
    emptyOption +
    combinations
      .map((c) => c.join(" + "))
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");
}

function getCombinations(weights) {
  const result = {};

  const generateCombinations = (combination, index) => {
    if (combination.length > 0) {
      const load = sumArr(combination);
      if (!result[load]) result[load] = [];
      result[load].push([...combination]);
    }

    for (let i = index; i < weights.length; i++) {
      const weight = weights[i];
      combination.push(weight);
      generateCombinations(combination, i + 1);
      combination.pop();
    }
  };

  generateCombinations([], 0);

  return result;
}

function printPreview({ type, weights }) {
  if (!type || !weights?.length) return;

  const anilhas = weights.map((w) => {
    const h = w === 1 ? 1.5 : w;
    return `<div class="anilha" style="height:${h}em">${w}</div>`;
  });
  const left = anilhas.join("");
  const right = [...anilhas].reverse().join("");

  document.getElementById("anilhas").innerHTML =
    removeDuplicates(anilhas).join("");
  document.getElementById("preview-content").innerHTML = `
    <h1 class="title">${type}</h1>

    ${
      type === "halter"
        ? `<div class="halter">
            <div class="side">${left}</div>
            <div class="side">${right}</div>
          </div>
          <div class="halter">
            <div class="side">${left}</div>
            <div class="side">${right}</div>
          </div>`
        : `<div class="barra">
            <div class="side">${left}</div>
            <div class="side">${right}</div>
          </div>`
    }
  `;
}

window.onload = function () {
  const storageState = JSON.parse(localStorage.getItem("state"));
  if (storageState) {
    Object.entries(storageState).forEach(
      ([key, value]) => (state[key] = value)
    );

    ["weights", "type", "load", "combination"].forEach(
      (id) => (document.getElementById(id).value = state[id])
    );

    printPreview({ type: state.type, weights: state.combination.split("+").map(Number) })
  }
};
