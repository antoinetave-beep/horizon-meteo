window.WEATHERNEXT_GRID = null;
window.WEATHERNEXT_ACCESS_GRANTED = true;

const isPrivateLocalWeatherApp = location.protocol === "file:"
  || location.hostname === "localhost"
  || location.hostname === "127.0.0.1";
const privateWeatherNextPath = "../PRIVE-NE-PAS-CHARGER-SUR-GITHUB/weathernext2-private.js";

function loadPrivateWeatherNext(fresh = false) {
  if (!isPrivateLocalWeatherApp) return Promise.resolve({ available: false });

  return new Promise((resolve, reject) => {
    document.getElementById("weathernext-private-refresh")?.remove();
    const privateWeatherNext = document.createElement("script");
    privateWeatherNext.id = "weathernext-private-refresh";
    privateWeatherNext.src = fresh
      ? `${privateWeatherNextPath}?actualisation=${Date.now()}`
      : privateWeatherNextPath;
    privateWeatherNext.defer = true;
    privateWeatherNext.addEventListener("load", () => resolve({ available: true }));
    privateWeatherNext.addEventListener("error", () => {
      window.dispatchEvent(new Event("weathernext-unavailable"));
      reject(new Error("Données WeatherNext privées introuvables."));
    });
    document.head.append(privateWeatherNext);
  });
}

window.reloadWeatherNextData = () => loadPrivateWeatherNext(true);
void loadPrivateWeatherNext().catch(() => {});
