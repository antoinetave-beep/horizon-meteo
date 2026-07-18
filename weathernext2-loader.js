window.WEATHERNEXT_GRID = null;
window.WEATHERNEXT_ACCESS_GRANTED = true;

const isPrivateLocalWeatherApp = location.protocol === "file:"
  || location.hostname === "localhost"
  || location.hostname === "127.0.0.1";

if (isPrivateLocalWeatherApp) {
  const privateWeatherNext = document.createElement("script");
  privateWeatherNext.src = location.protocol === "file:"
    ? "../PRIVE-NE-PAS-CHARGER-SUR-GITHUB/weathernext2-private.js"
    : "../PRIVE-NE-PAS-CHARGER-SUR-GITHUB/weathernext2-private.js";
  privateWeatherNext.defer = true;
  privateWeatherNext.addEventListener("error", () => {
    window.dispatchEvent(new Event("weathernext-unavailable"));
  });
  document.head.append(privateWeatherNext);
}
