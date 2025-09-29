const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

const mock = {
  city: "London, GB",
  tz: "Europe/London",
  updated: Date.now(),
  unit: "metric",
  current: {
    temp: 18.4,
    feels: 18.0,
    condition: "Partly cloudy",
    wind_kmh: 14,
    humidity: 62
  },
  hourly: [
    { t: 0, temp: 18, icon: "⛅" },
    { t: 1, temp: 18, icon: "⛅" },
    { t: 2, temp: 17, icon: "☁️" },
    { t: 3, temp: 17, icon: "☁️" },
    { t: 4, temp: 16, icon: "🌧️" },
    { t: 5, temp: 16, icon: "🌧️" }
  ]
};

const elCurrent = $("#current");
const elHourly = $("#hourly");
const form = $("#search");
const input = $("#q");
const unitRadios = $$('input[name="unit"]');

let state = structuredClone(mock);

render(state);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = input.value.trim() || mock.city;
  const unit = unitRadios.find(r => r.checked)?.value || "metric";
  const data = makeMockFor(city, unit);
  state = data;
  render(state);
});

function makeMockFor(city, unit) {
  const isMetric = unit === "metric";
  const base = isMetric ? 18 : cToF(18);
  const step = isMetric ? 1 : cToF(1) - cToF(0);
  return {
    city,
    tz: mock.tz,
    updated: Date.now(),
    unit,
    current: {
      temp: round(base + 0.4),
      feels: round(base),
      condition: "Partly cloudy",
      wind_kmh: isMetric ? 14 : Math.round(14 / 1.609),
      humidity: 62
    },
    hourly: Array.from({length:6}, (_,i)=>({
      t: i,
      temp: round(base - i*step*0.5),
      icon: ["⛅","☁️","🌧️","🌤️"][i%4]
    }))
  };
}

function render(s) {
  elCurrent.innerHTML = `
    <div class="current-top">
      <div>
        <div class="current-city">${escapeHTML(s.city)}</div>
        <div class="current-meta">${fmtDateTime(s.updated, s.tz)}</div>
      </div>
      <div class="current-temp">${fmtTemp(s.current.temp, s.unit)}</div>
    </div>
    <div class="current-grid">
      <div class="stat">
        <div class="label">Feels like</div>
        <div class="value">${fmtTemp(s.current.feels, s.unit)}</div>
      </div>
      <div class="stat">
        <div class="label">Condition</div>
        <div class="value">${s.current.condition}</div>
      </div>
      <div class="stat">
        <div class="label">Wind</div>
        <div class="value">${fmtWind(s.current.wind_kmh, s.unit)}</div>
      </div>
      <div class="stat">
        <div class="label">Humidity</div>
        <div class="value">${s.current.humidity}%</div>
      </div>
    </div>
  `;

  elHourly.innerHTML = `
    <h3>Next hours</h3>
    <div class="hours">
      ${s.hourly.map(h => `
        <div class="hour">
          <div class="x">${fmtHour(h.t, s.tz)}</div>
          <div class="t">${fmtTemp(h.temp, s.unit)}</div>
          <div class="x">${h.icon}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function fmtTemp(v, unit) {
  return unit === "metric" ? `${round(v)}°C` : `${round(v)}°F`;
}
function fmtWind(v, unit) {
  return unit === "metric" ? `${v} km/h` : `${v} mph`;
}
function fmtDateTime(ts, tz) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { timeZone: tz, hour12:false });
}
function fmtHour(offsetHrs, tz) {
  const d = new Date(Date.now() + offsetHrs*3600*1000);
  return d.toLocaleTimeString(undefined, { timeZone: tz, hour:'2-digit', minute:'2-digit', hour12:false });
}
function round(x){ return Math.round(x); }
function cToF(c){ return c*9/5+32; }

function escapeHTML(s){
  const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
  return s.replace(/[&<>"']/g, c => map[c]);
}
