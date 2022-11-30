// Create a list of violations
const list = new mdc.list.MDCList(document.querySelector('.mdc-list'));

// Get query parameters from URL
const query = window.location.search.substr(1);
const params = query.split('&').reduce((accumulator, singleQueryParam) => {
  const [key, value] = singleQueryParam.split('=');
  accumulator[key] = decodeURIComponent(value);
  return accumulator;
}, {});

// Fetch the health department records for the given location
fetch(`https://data.cityofchicago.org/resource/4ijn-s7e5.json?$where=zip%20=%20${params.zip}`)
  .then((response) => response.json())
  .then((data) => {
    const name = params.name.toUpperCase();
    const relevantRecord = data.find((place) => {
      if (place.dba_name && place.dba_name.includes(name)) {
        return true;
      } else if (place.aka_name && place.aka_name.includes(name)) {
        return true;
      }

      return false;
    });

    // Clear "no violations" message if violations found
    const violations = relevantRecord.violations.split("|");
    const violationList = document.querySelector("#violations");
    if (violations.length) {
      violationList.innerHTML = "";
    }

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