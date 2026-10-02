/* =====================================================
   SAMPLE ITEMS

   In production these should come from your backend.
===================================================== */

let items = [

  {
    id: "CCTC-001",
    name: "Black Wireless Headphones",
    category: "Electronics",
    location: "Library",
    reportedDate: "August 13, 2026",
    claimedDate: null,
    status: "Unclaimed",

    description:
      "A pair of black wireless headphones found on a study table in the CCTC library.",

    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",

    reportedBy: "CCTC-2026-015"
  },

  {
    id: "CCTC-002",
    name: "Blue Student ID",
    category: "School",
    location: "Main Building",
    reportedDate: "August 13, 2026",
    claimedDate: null,
    status: "Unclaimed",

    description:
      "A blue student identification card found near the main building entrance.",

    image:
      "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=900&q=80",

    reportedBy: "CCTC-2026-022"
  },

  {
    id: "CCTC-003",
    name: "Black Wallet",
    category: "Personal",
    location: "Cafeteria",
    reportedDate: "August 12, 2026",
    claimedDate: null,
    status: "Unclaimed",

    description:
      "A small black wallet found underneath a cafeteria table.",

    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",

    reportedBy: "CCTC-2026-008"
  },

  {
    id: "CCTC-004",
    name: "Silver Laptop",
    category: "Electronics",
    location: "Computer Laboratory",
    reportedDate: "August 11, 2026",
    claimedDate: "August 12, 2026",
    status: "Claimed",

    description:
      "A silver laptop found inside the computer laboratory and successfully returned to its owner.",

    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",

    reportedBy: "CCTC-2026-031"
  },

  {
    id: "CCTC-005",
    name: "Red Water Bottle",
    category: "Personal",
    location: "Gymnasium",
    reportedDate: "August 10, 2026",
    claimedDate: null,
    status: "Unclaimed",

    description:
      "A red reusable water bottle found near the gymnasium bleachers.",

    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",

    reportedBy: "CCTC-2026-041"
  },

  {
    id: "CCTC-006",
    name: "Black Baseball Cap",
    category: "Clothing",
    location: "Gymnasium",
    reportedDate: "August 9, 2026",
    claimedDate: "August 10, 2026",
    status: "Claimed",

    description:
      "A black baseball cap discovered near the gymnasium entrance.",

    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",

    reportedBy: "CCTC-2026-012"
  }

];


/* =====================================================
   USER ACCOUNT STORAGE
===================================================== */

let currentUser =
  JSON.parse(
    localStorage.getItem("cctcCurrentUser")
  );

let users =
  JSON.parse(
    localStorage.getItem("cctcUsers")
  ) || [];


/*
 * Demo account for testing.
 *
 * IMPORTANT:
 * This is only for frontend demonstration.
 * Passwords must NEVER be stored this way in production.
 */

if (users.length === 0) {

  users.push({
    schoolId: "CCTC-DEMO-001",
    name: "Juan Dela Cruz",
    section: "BSIT-2A",
    schoolYear: "2026-2027",
    password: "123456",
    createdAt: "August 1, 2026"
  });

  localStorage.setItem(
    "cctcUsers",
    JSON.stringify(users)
  );

}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(page) {

  const pages = [
    "dashboard",
    "items",
    "history",
    "profile"
  ];

  pages.forEach(name => {

    const section =
      document.getElementById(
        name + "Page"
      );

    if (section) {

      section.classList.toggle(
        "active",
        name === page
      );

    }

  });


  document
    .querySelectorAll(".nav-link")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

    });


  if (page === "history") {
    renderHistory();
  }

  if (page === "profile") {
    renderProfile();
  }

  if (page === "dashboard") {
    renderDashboard();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   SEARCH
===================================================== */

const searchInput =
  document.getElementById("searchInput");

const categoryFilter =
  document.getElementById("categoryFilter");

const locationFilter =
  document.getElementById("locationFilter");

const statusFilter =
  document.getElementById("statusFilter");


function performSearch() {

  showPage("items");

  filterItems();

}


function filterItems() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const category =
    categoryFilter.value;


  const location =
    locationFilter.value;


  const status =
    statusFilter.value;


  const filtered =
    items.filter(item => {

      const text = `
        ${item.name}
        ${item.category}
        ${item.location}
        ${item.description}
        ${item.id}
      `.toLowerCase();


      return (

        (!search || text.includes(search)) &&

        (!category ||
          item.category === category) &&

        (!location ||
          item.location === location) &&

        (!status ||
          item.status === status)

      );

    });


  renderItems(filtered);

}


function clearFilters() {

  searchInput.value = "";

  categoryFilter.value = "";

  locationFilter.value = "";

  statusFilter.value = "";

  renderItems(items);

}


searchInput.addEventListener(
  "input",
  () => {

    if (
      document
        .getElementById("itemsPage")
        .classList.contains("active")
    ) {

      filterItems();

    }

  }
);


categoryFilter.addEventListener(
  "change",
  filterItems
);

locationFilter.addEventListener(
  "change",
  filterItems
);

statusFilter.addEventListener(
  "change",
  filterItems
);


searchInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      performSearch();
    }

  }
);


/* =====================================================
   RENDER ITEMS
===================================================== */

function renderItems(data) {

  const grid =
    document.getElementById("itemsGrid");

  const empty =
    document.getElementById("emptyState");

  const result =
    document.getElementById("resultText");


  grid.innerHTML = "";


  if (data.length === 0) {

    empty.style.display = "block";

    result.textContent =
      "No matching items.";

    return;

  }


  empty.style.display = "none";

  result.textContent =
    `${data.length} item${data.length === 1 ? "" : "s"} found`;


  data.forEach((item, index) => {

    const card =
      document.createElement("article");

    card.className = "item-card";

    card.style.animationDelay =
      `${index * 45}ms`;


    card.innerHTML = `

      <div class="item-image">

        <img
          src="${item.image}"
          alt="${item.name}"
          loading="lazy"
        >

        <div class="status ${
          item.status === "Claimed"
            ? "claimed"
            : "unclaimed"
        }">

          ${
            item.status === "Claimed"
              ? "✓ Claimed"
              : "● Unclaimed"
          }

        </div>

      </div>


      <div class="item-content">

        <div class="item-category">
          ${item.category}
        </div>

        <h3 class="item-title">
          ${item.name}
        </h3>

        <div class="item-meta">

          <span>
            📍 ${item.location}
          </span>

          <span>
            📅 Reported: ${item.reportedDate}
          </span>

          <span>
            ${
              item.claimedDate
                ? `✓ Claimed: ${item.claimedDate}`
                : "⏳ Not claimed"
            }
          </span>

        </div>


        <button
          class="view-button"
          onclick="openItemModal('${item.id}')"
        >
          View Full Details →
        </button>

      </div>

    `;


    grid.appendChild(card);

  });

}


/* =====================================================
   ITEM DETAILS
===================================================== */

let currentItem = null;


function openItemModal(id) {

  currentItem =
    items.find(item =>
      item.id === id
    );


  if (!currentItem) return;


  document.getElementById("modalImage")
    .src = currentItem.image;

  document.getElementById("modalImage")
    .alt = currentItem.name;

  document.getElementById("modalCategory")
    .textContent = currentItem.category;

  document.getElementById("modalTitle")
    .textContent = currentItem.name;

  document.getElementById("modalDescription")
    .textContent = currentItem.description;

  document.getElementById("modalLocation")
    .textContent = currentItem.location;

  document.getElementById("modalReported")
    .textContent = currentItem.reportedDate;

  document.getElementById("modalClaimed")
    .textContent =
      currentItem.claimedDate ||
      "Not claimed";

  document.getElementById("modalStatus")
    .textContent = currentItem.status;

  document.getElementById("modalId")
    .textContent = currentItem.id;


  const claimButton =
    document.getElementById("claimButton");


  if (currentItem.status === "Claimed") {

    claimButton.disabled = true;

    claimButton.textContent =
      "✓ This Item Has Been Claimed";

    claimButton.style.opacity = "0.6";

  } else {

    claimButton.disabled = false;

    claimButton.textContent =
      "This Is My Item";

    claimButton.style.opacity = "1";

  }


  document
    .getElementById("itemOverlay")
    .classList.add("active");

  document.body.style.overflow =
    "hidden";

}


function closeItemModal() {

  document
    .getElementById("itemOverlay")
    .classList.remove("active");

  document.body.style.overflow = "";

  currentItem = null;

}


function closeItemOutside(event) {

  if (
    event.target.id === "itemOverlay"
  ) {

    closeItemModal();

  }

}


/* =====================================================
   REPORT ITEM
===================================================== */

function openReportModal() {

  document
    .getElementById("reportOverlay")
    .classList.add("active");

  document.body.style.overflow =
    "hidden";

}


function closeReportModal() {

  document
    .getElementById("reportOverlay")
    .classList.remove("active");

  document.body.style.overflow = "";

  // Clear form
  document.getElementById("reportName").value = "";
  document.getElementById("reportCategory").value = "";
  document.getElementById("reportLocation").value = "";
  document.getElementById("reportDescription").value = "";
  document.getElementById("reportDate").value = "";
  document.getElementById("reportEmail").value = "";

}


function closeReportOutside(event) {

  if (
    event.target.id === "reportOverlay"
  ) {

    closeReportModal();

  }

}


function submitReport() {

  const name =
    document.getElementById("reportName")
      .value.trim();

  const category =
    document.getElementById("reportCategory")
      .value;

  const location =
    document.getElementById("reportLocation")
      .value;

  const description =
    document.getElementById("reportDescription")
      .value.trim();

  const date =
    document.getElementById("reportDate")
      .value;

  const email =
    document.getElementById("reportEmail")
      .value.trim();


  // Validation
  if (!name) {
    showToast("Please enter an item name.");
    return;
  }

  if (!category) {
    showToast("Please select a category.");
    return;
  }

  if (!location) {
    showToast("Please select a location.");
    return;
  }

  if (!description) {
    showToast("Please add a description.");
    return;
  }

  if (!date) {
    showToast("Please select a date.");
    return;
  }

  if (!email || !email.includes("@")) {
    showToast("Please enter a valid email.");
    return;
  }


  // Generate item ID
  const newId =
    "CCTC-" +
    String(items.length + 1).padStart(3, "0");


  // Get today's date formatted
  const reportedDate =
    new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );


  // Create new item object
  const newItem = {
    id: newId,
    name: name,
    category: category,
    location: location,
    reportedDate: reportedDate,
    claimedDate: null,
    status: "Unclaimed",
    description: description,
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80",
    reportedBy: email
  };


  // Add to items array
  items.push(newItem);


  // Close modal and show success
  closeReportModal();

  showToast(
    "✓ Item reported successfully! Item ID: " + newId
  );

  // Optionally render dashboard to show new item
  renderDashboard();

}


/* =====================================================
   CLAIM
===================================================== */

function claimCurrentItem() {

  if (!currentItem) return;


  if (!currentUser) {

    closeItemModal();

    openAuth("login");

    showToast(
      "Please sign in before claiming an item."
    );

    return;

  }


  if (
    currentItem.status === "Claimed"
  ) {

    return;

  }


  /*
   * In the real system this should create
   * a CLAIM REQUEST rather than immediately
   * changing the item to claimed.
   */

  const today =
    new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );


  currentItem.status =
    "Claimed";

  currentItem.claimedDate =
    today;

  currentItem.claimedBy =
    currentUser.schoolId;


  saveItems();


  closeItemModal();

  renderItems(items);

  renderDashboard();

  renderHistory();


  showToast(
    "Your claim has been recorded."
  );

}


/* =====================================================
   SIGN UP
===================================================== */

function signup() {

  const schoolId =
    document
      .getElementById("signupSchoolId")
      .value
      .trim();

  const name =
    document
      .getElementById("signupName")
      .value
      .trim();

  const section =
    document
      .getElementById("signupSection")
      .value
      .trim();

  const schoolYear =
    document
      .getElementById("signupYear")
      .value;

  const password =
    document
      .getElementById("signupPassword")
      .value;

  const confirmPassword =
    document
      .getElementById("signupConfirmPassword")
      .value;


  if (
    !schoolId ||
    !name ||
    !section ||
    !schoolYear ||
    !password ||
    !confirmPassword
  ) {

    showToast(
      "Please complete all required fields."
    );

    return;

  }


  if (password !== confirmPassword) {

    showToast(
      "Passwords do not match."
    );

    return;

  }


  if (password.length < 6) {

    showToast(
      "Password must contain at least 6 characters."
    );

    return;

  }


  const exists =
    users.some(user =>
      user.schoolId.toLowerCase() ===
      schoolId.toLowerCase()
    );


  if (exists) {

    showToast(
      "That School ID already has an account."
    );

    return;

  }


  const createdAt =
    new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );


  const newUser = {

    schoolId,

    name,

    section,

    schoolYear,

    password,

    createdAt

  };


  users.push(newUser);


  localStorage.setItem(
    "cctcUsers",
    JSON.stringify(users)
  );


  currentUser =
    newUser;


  localStorage.setItem(
    "cctcCurrentUser",
    JSON.stringify(currentUser)
  );


  closeAuth();

  updateAuthUI();

  renderProfile();

  renderHistory();

  showPage("dashboard");


  showToast(
    `Welcome to CCTC Lost & Found, ${name}!`
  );

}


/* =====================================================
   LOGIN
===================================================== */

function login() {

  const schoolId =
    document
      .getElementById("loginSchoolId")
      .value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      .value;


  const user =
    users.find(
      account =>
        account.schoolId.toLowerCase() ===
          schoolId.toLowerCase() &&
        account.password === password
    );


  if (!user) {

    showToast(
      "Incorrect School ID or password."
    );

    return;

  }


  currentUser = user;


  localStorage.setItem(
    "cctcCurrentUser",
    JSON.stringify(currentUser)
  );


  closeAuth();

  updateAuthUI();

  renderProfile();

  renderHistory();

  renderDashboard();


  showToast(
    `Welcome back, ${user.name}!`
  );

}


/* =====================================================
   AUTH UI
===================================================== */

function openAuth(type = "login") {

  document
    .getElementById("authOverlay")
    .classList.add("active");

  switchAuth(type);

  document.body.style.overflow =
    "hidden";

}


function closeAuth() {

  document
    .getElementById("authOverlay")
    .classList.remove("active");

  document.body.style.overflow = "";

}


function switchAuth(type) {

  const loginForm =
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");


  if (type === "signup") {

    loginForm.style.display = "none";
    signupForm.style.display = "block";

  } else {

    loginForm.style.display = "block";
    signupForm.style.display = "none";

  }

}


/* =====================================================
   PROFILE
===================================================== */

function renderProfile() {

  if (!currentUser) {

    document.getElementById("profileName")
      .textContent = "Guest Student";

    document.getElementById("profileId")
      .textContent =
        "Sign in to view your account";

    document.getElementById("infoId")
      .textContent = "—";

    document.getElementById("infoName")
      .textContent = "—";

    document.getElementById("infoSection")
      .textContent = "—";

    document.getElementById("infoYear")
      .textContent = "—";

    document.getElementById("infoCreated")
      .textContent = "—";

    return;

  }


  const initials =
    currentUser.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();


  document.getElementById("largeAvatar")
    .textContent = initials;


  document.getElementById("profileName")
    .textContent =
      currentUser.name;


  document.getElementById("profileId")
    .textContent =
      currentUser.schoolId;


  document.getElementById("infoId")
    .textContent =
      currentUser.schoolId;


  document.getElementById("infoName")
    .textContent =
      currentUser.name;


  document.getElementById("infoSection")
    .textContent =
      currentUser.section;


  document.getElementById("infoYear")
    .textContent =
      currentUser.schoolYear;


  document.getElementById("infoCreated")
    .textContent =
      currentUser.createdAt;

}


/* =====================================================
   USER HISTORY
===================================================== */

function renderHistory() {

  const container =
    document.getElementById("historyList");


  if (!currentUser) {

    container.innerHTML = `

      <div class="empty-state"
           style="display:block">

        <div class="empty-icon">
          🔐
        </div>

        <h3>
          Sign in to view your history
        </h3>

        <p>
          Your reported and claimed items will appear here.
        </p>

        <br>

        <button
          class="auth-button"
          onclick="openAuth('login')"
        >
          Sign In
        </button>

      </div>

    `;

    return;

  }


  /*
   * Items reported by this user.
   */

  const reported =
    items.filter(item =>
      item.reportedBy ===
      currentUser.schoolId
    );


  /*
   * Items claimed by this user.
   */

  const claimed =
    items.filter(item =>
      item.claimedBy ===
      currentUser.schoolId
    );


  const history = [
    ...reported.map(item => ({
      ...item,
      action: "Reported",
      date: item.reportedDate
    })),

    ...claimed.map(item => ({
      ...item,
      action: "Claimed",
      date: item.claimedDate
    }))
  ];


  /*
   * Remove duplicates.
   */

  const unique =
    history.filter(
      (item, index, array) =>
        index ===
        array.findIndex(
          other =>
            other.id === item.id &&
            other.action === item.action
        )
    );


  if (unique.length === 0) {

    container.innerHTML = `

      <div class="empty-state"
           style="display:block">

        <div class="empty-icon">
          📋
        </div>

        <h3>
          No history yet
        </h3>

        <p>
          Items you report or claim will appear here.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    unique.map(item => `

      <div class="history-card">

        <div class="history-left">

          <div class="history-icon">
            ${
              item.action === "Claimed"
                ? "✓"
                : "📦"
            }
          </div>

          <div>

            <div class="history-name">
              ${item.name}
            </div>

            <div class="history-description">
              ${item.category} • ${item.location}
            </div>

            <div class="history-status">
              ${item.action}
            </div>

          </div>

        </div>


        <div class="history-date">

          ${item.date}

          <br>

          ${item.id}

        </div>

      </div>

    `).join("");

}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

  document.getElementById("totalItems")
    .textContent = items.length;


  document.getElementById("unclaimedItems")
    .textContent =
      items.filter(
        item =>
          item.status === "Unclaimed"
      ).length;


  document.getElementById("claimedItems")
    .textContent =
      items.filter(
        item =>
          item.status === "Claimed"
      ).length;


  /*
   * Demo calculation:
   * reports on the current date.
   */

  const today =
    new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );


  document.getElementById("todayReports")
    .textContent =
      items.filter(
        item =>
          item.reportedDate === today
      ).length;


  if (currentUser) {

    document.getElementById("welcomeText")
      .textContent =
        `Welcome back, ${currentUser.name}`;

  } else {

    document.getElementById("welcomeText")
      .textContent =
        "Welcome to CCTC Lost & Found";

  }


  renderActivity();

}


/* =====================================================
   GENERAL ACTIVITY
===================================================== */

function renderActivity() {

  const container =
    document.getElementById(
      "activityList"
    );


  const activity = [];


  items.forEach(item => {

    activity.push({

      item,

      type: "reported",

      date: item.reportedDate

    });


    if (item.claimedDate) {

      activity.push({

        item,

        type: "claimed",

        date: item.claimedDate

      });

    }

  });


  /*
   * For the frontend prototype we reverse
   * the list to show recent activity first.
   */

  activity.reverse();


  const recent =
    activity.slice(0, 8);


  container.innerHTML =
    recent.map(event => `

      <div class="activity-row">

        <div class="activity-info">

          <div class="activity-icon">

            ${
              event.type === "claimed"
                ? "✓"
                : "📦"
            }

          </div>


          <div>

            <div class="activity-name">
              ${event.item.name}
            </div>

            <div class="activity-date">

              ${
                event.type === "claimed"
                  ? "Claimed"
                  : "Reported"
              }

              • ${event.date}

            </div>

          </div>

        </div>


        <div
          class="activity-status ${
            event.type
          }"
        >

          ${
            event.type === "claimed"
              ? "CLAIMED"
              : "REPORTED"
          }

        </div>

      </div>

    `).join("");

}


/* =====================================================
   AUTH NAVBAR
===================================================== */

function updateAuthUI() {

  const authButton =
    document.getElementById(
      "authButton"
    );

  const reportButton =
    document.getElementById(
      "reportButton"
    );

  const profileButton =
    document.getElementById(
      "profileButton"
    );

  const logoutButton =
    document.getElementById(
      "logoutButton"
    );


  if (currentUser) {

    authButton.style.display =
      "none";

    reportButton.style.display =
      "block";

    profileButton.style.display =
      "grid";

    logoutButton.style.display =
      "inline-block";


    const initials =
      currentUser.name
        .split(" ")
        .map(name => name[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();


    profileButton.textContent =
      initials;

  } else {

    authButton.style.display =
      "block";

    reportButton.style.display =
      "none";

    profileButton.style.display =
      "none";

    logoutButton.style.display =
      "none";

  }

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

  currentUser = null;

  localStorage.removeItem(
    "cctcCurrentUser"
  );

  updateAuthUI();

  renderProfile();

  renderHistory();

  renderDashboard();

  showPage("dashboard");

  showToast(
    "You have been signed out."
  );

}


/* =====================================================
   SAVE ITEMS
===================================================== */

function saveItems() {

  localStorage.setItem(
    "cctcItems",
    JSON.stringify(items)
  );

}


/*
 * Load saved item state if available.
 */

const savedItems =
  localStorage.getItem(
    "cctcItems"
  );


if (savedItems) {

  try {

    items =
      JSON.parse(savedItems);

  } catch (error) {

    console.error(
      "Could not load saved items.",
      error
    );

  }

}


/* =====================================================
   THEME
===================================================== */

function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );


  const dark =
    document.body.classList.contains(
      "dark"
    );


  document.getElementById(
    "themeButton"
  ).textContent =
    dark ? "☀" : "☾";


  localStorage.setItem(
    "cctcTheme",
    dark ? "dark" : "light"
  );

}


if (
  localStorage.getItem(
    "cctcTheme"
  ) === "dark"
) {

  document.body.classList.add(
    "dark"
  );

  document.getElementById(
    "themeButton"
  ).textContent = "☀";

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3200);

}


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeAuth();
      closeItemModal();

    }

  }
);


/* =====================================================
   INITIALIZATION
===================================================== */

renderItems(items);

renderDashboard();

renderProfile();

renderHistory();

updateAuthUI();
