// Create a list of violations
const list = new mdc.list.MDCList(document.querySelector('.mdc-list'));

// Get query parameters from URL
const query = document.cookie;
const params = query.split('&').reduce((accumulator, singleQueryParam) => {
  const [key, value] = singleQueryParam.split('=');
  accumulator[key] = decodeURIComponent(value);
  return accumulator;
}, {});

// Fetch the health department records for the given location
fetch(`https://data.cityofchicago.org/resource/4ijn-s7e5.json?$where=zip%20=%20${params.zip}&$limit=1000&$$app_token=iYzpfo9SlG3yWBUqqp0pEpvK0`)
  .then((response) => response.json())
  .then((data) => {
    // Find the relevant record
    const name = params.name.toUpperCase();
    const relevantRecord = data.find((place) => {
      if (place.dba_name && place.dba_name.includes(name)) {
        return true;
      } else if (place.aka_name && place.aka_name.includes(name)) {
        return true;
      }

      return false;
    });

    // No inspections found for restaurant
    if (!relevantRecord) {
      return;
    }

    // Clear "no violations" message if violations found
    const violations = relevantRecord.violations.split("|");
    const violationList = document.querySelector("#violations");
    if (violations.length) {
      violationList.innerHTML = "";
    }

    // List out all the violations
    violations.forEach((violation) => {
      const li = document.createElement("li");
      li.classList.add("mdc-list-item");
      li.classList.add("mdc-list-item--disabled");

      const liText = document.createElement("span");
      liText.classList.add("mdc-list-item__text");
      liText.innerHTML = `❌ Violation: ${violation}`;

      li.append(liText);
      violationList.append(li);
    });
  });