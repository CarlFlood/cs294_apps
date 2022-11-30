// Get query parameters from URL
const query = window.location.search.substr(1);
const params = query.split('&').reduce((accumulator, singleQueryParam) => {
  const [key, value] = singleQueryParam.split('=');
  accumulator[key] = decodeURIComponent(value);
  return accumulator;
}, {});

// Database
const db = new Dexie("ReviewsDatabase");
db.version(4).stores({
  reviews: '++id,title,text,place_id',
});

// Render all reviews onto page
let reviews = [];
async function renderReviews() {
  // Reset reviews list content
  const reviewsList = document.querySelector("#reviews");
  reviewsList.innerHTML = "";

  // Populate review list
  reviews.forEach((review) => {
    const itemRipple = document.createElement("span");
    itemRipple.classList.add("mdc-list-item__ripple");

    const itemTitle = document.createElement("span");
    itemTitle.classList.add("mdc-list-item__primary-text");
    itemTitle.innerHTML = review.title;

    const itemText = document.createElement("span");
    itemText.classList.add("mdc-list-item__secondary-text");
    itemText.innerHTML = review.text;

    const tex = document.createElement("span");
    tex.classList.add("mdc-list-item__text");
    tex.appendChild(itemTitle);
    tex.appendChild(itemText);

    const itemTemplate = document.createElement("li");
    itemTemplate.classList.add("mdc-list-item");
    itemTemplate.classList.add("mdc-list-item--disabled");
    itemTemplate.tabIndex = 0;
    itemTemplate.appendChild(itemRipple);
    itemTemplate.appendChild(tex);

    reviewsList.appendChild(itemTemplate);
  });
}

// Get all reviews from database
const getReviews = async () => {
  reviews = await db.reviews.where({ place_id: params.place_id }).reverse().toArray();
}
getReviews().then(() => renderReviews());

// Add Review Dialog
const dialog = new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog'));
const textField = new mdc.textField.MDCTextField(document.querySelector('#text'));
const titleField = new mdc.textField.MDCTextField(document.querySelector('#title'));

// Open new review modal
document.querySelector("#openAddModal").addEventListener("click", () => {
  dialog.open();
});

// Save review
document.querySelector("#saveNewReview").addEventListener("click", () => {
  const newTextInput = document.querySelector("#newReviewText");
  const newTitleInput = document.querySelector("#newReviewTitle");
  const text = newTextInput.value;
  const title = newTitleInput.value;

  newTextInput.value = "";
  newTitleInput.value = "";

  // Save in database
  db.reviews.add({ title, text, place_id: params.place_id })
    .then(() => {
      getReviews().then(() => renderReviews());
    })
    .catch(err => {
      alert("An error occured while inserting a review: " + err);
    });
})