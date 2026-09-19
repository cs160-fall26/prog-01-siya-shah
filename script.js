const transports = [
  { id: 'walking', name: 'Walking', speed: 3.1, range: 30 },
  { id: 'evolve', name: 'Evolve Bamboo GTR', speed: 24, range: 31 },
  { id: 'onewheel', name: 'Onewheel GT', speed: 20, range: 32 },
  { id: 'razor', name: 'Razor E Prime III', speed: 18, range: 15 },
  { id: 'mototec', name: 'MotoTec Electric Skateboard', speed: 22, range: 10 },
  { id: 'segway', name: 'Segway Ninebot S2', speed: 11, range: 22 },
  { id: 'unagi', name: 'Unagi Model One E500', speed: 19, range: 15.5 },
  { id: 'inmotion', name: 'Inmotion V8S Unicycle', speed: 22, range: 47 }
];

const fromDisplay = document.getElementById('fromDisplay');
const toSelect = document.getElementById('toSelect');
const swapBtn = document.getElementById('swapBtn');
const valueInput = document.getElementById('valueInput');
const valueLabel = document.getElementById('valueLabel');
const transportSelect = document.getElementById('transportSelect');
const sortSelect = document.getElementById('sortSelect');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const results = document.getElementById('results');
let fromUnit = 'distance';

function populateTransportOptions() {
  transports.forEach((transport) => {
    const option = document.createElement('option');
    option.value = transport.id;
    option.textContent = transport.name;
    transportSelect.appendChild(option);
  });
}

function updateInputMode(resetValue = false) {
  const opposite = fromUnit === 'distance' ? 'time' : 'distance';
  fromDisplay.textContent = fromUnit === 'distance' ? 'Distance' : 'Time';
  toSelect.textContent = opposite === 'distance' ? 'Distance' : 'Time';

  if (fromUnit === 'distance') {
    valueLabel.textContent = 'Distance (miles):';
    valueInput.placeholder = 'e.g. 4';
  } else {
    valueLabel.textContent = 'Time (minutes):';
    valueInput.placeholder = 'e.g. 30';
  }

  if (resetValue) valueInput.value = '';
}

function formatTime(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return '—';
  }

  if (minutes < 1) {
    return `${Math.round(minutes * 60)} sec`;
  }

  return `${minutes.toFixed(1)}<span class="unit-label"> min</span>`;
}

function formatDistance(miles) {
  if (!Number.isFinite(miles) || miles < 0) {
    return '—';
  }

  return `${miles.toFixed(2)}<span class="unit-label"> mi</span>`;
}

function getSelectedTransport() {
  return transportSelect.value
    ? transports.find((t) => t.id === transportSelect.value)
    : null;
}

function cardMarkup(transport, mainText, warningText = '') {
  const warning = warningText
    ? `<div class="warning"><span class="warning-icon">!</span> ${warningText}</div>`
    : '';
  const cardClass = warningText ? 'result-card warning-card' : 'result-card';

  return `
    <article class="${cardClass}">
      <div class="result-left">
        <div class="transport-copy">
          <div class="transport-name">${transport.name}</div>
          ${warning}
        </div>
      </div>
      <div class="result-value">
        <div>${mainText}</div>
      </div>
    </article>
  `;
}

function computeDistanceToTime(distanceMiles, transport) {
  return (distanceMiles / transport.speed) * 60;
}

function computeTimeToDistance(minutes, transport) {
  return (minutes / 60) * transport.speed;
}

function convert(rawValue, transport, unitMode) {
  return unitMode === 'distance'
    ? computeDistanceToTime(rawValue, transport)
    : computeTimeToDistance(rawValue, transport);
}

function renderEmptyState(message) {
  results.innerHTML = `<div class="empty-state">${message}</div>`;
}

function getSortValue(transport, rawValue) {
  return convert(rawValue, transport, fromUnit);
}

function createResultCard(transport, rawValue, unitMode) {
  const convertedValue = convert(rawValue, transport, unitMode);
  const isRangeExceeded = unitMode === 'distance' ? rawValue > transport.range : convertedValue > transport.range;
  const warning = isRangeExceeded ? 'Exceeds range' : '';

  if (unitMode === 'distance') {
    return cardMarkup(transport, formatTime(convertedValue), warning);
  }
  return cardMarkup(transport, formatDistance(convertedValue), warning);
}

function calculate() {
  const rawValue = Number(valueInput.value);
  const selectedTransport = getSelectedTransport();

  if (rawValue <= 0) {
    renderEmptyState('Enter a positive number.');
    return;
  }

  if (selectedTransport) {
    results.innerHTML = createResultCard(selectedTransport, rawValue, fromUnit);
    return;
  }

  const sortDirection = sortSelect.value;
  const candidateTransports = [...transports].sort((a, b) => {
    const aValue = getSortValue(a, rawValue);
    const bValue = getSortValue(b, rawValue);

    return sortDirection === 'ascending' ? aValue - bValue : bValue - aValue;
  });

  const cards = candidateTransports.map((transport) =>
    createResultCard(transport, rawValue, fromUnit)
  );

  results.innerHTML = cards.join('');
}

function resetAll() {
  fromUnit = 'distance';
  transportSelect.value = '';
  sortSelect.value = 'ascending';
  valueInput.value = '';
  updateInputMode(true);
  renderEmptyState('Choose a value and press Calculate.');
}

swapBtn.addEventListener('click', () => {
  fromUnit = fromUnit === 'distance' ? 'time' : 'distance';
  updateInputMode(false);
});

calculateBtn.addEventListener('click', calculate);
sortSelect.addEventListener('change', calculate);
resetBtn.addEventListener('click', resetAll);

populateTransportOptions();
resetAll();
