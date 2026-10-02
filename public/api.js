/* Connects the website to the database through server.js.
   Loaded AFTER script.js, so these functions replace the localStorage versions. */

let token = localStorage.getItem("cctcToken");

async function api(path, method = "GET", body) {
  const res = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

async function loadItems() {
  items = await api("/items");
  renderItems(items);
  renderDashboard();
  renderHistory();
}

async function startSession(data, message) {
  token = data.token;
  currentUser = data.user;
  localStorage.setItem("cctcToken", token);
  closeAuth();
  updateAuthUI();
  renderProfile();
  await loadItems();
  showPage("dashboard");
  showToast(message);
}

async function signup() {
  const value = id => document.getElementById(id).value;
  if (value("signupPassword") !== value("signupConfirmPassword"))
    return showToast("Passwords do not match.");
  try {
    const data = await api("/signup", "POST", {
      schoolId: value("signupSchoolId"), name: value("signupName"),
      section: value("signupSection"), schoolYear: value("signupYear"),
      password: value("signupPassword")
    });
    startSession(data, `Welcome to CCTC Lost & Found, ${data.user.name}!`);
  } catch (e) { showToast(e.message); }
}

async function login() {
  try {
    const data = await api("/login", "POST", {
      schoolId: document.getElementById("loginSchoolId").value,
      password: document.getElementById("loginPassword").value
    });
    startSession(data, `Welcome back, ${data.user.name}!`);
  } catch (e) { showToast(e.message); }
}

async function logout() {
  try { await api("/logout", "POST"); } catch (e) {}
  token = null;
  currentUser = null;
  localStorage.removeItem("cctcToken");
  updateAuthUI();
  renderProfile();
  renderHistory();
  renderDashboard();
  showPage("dashboard");
  showToast("You have been signed out.");
}

async function submitReport() {
  const value = id => document.getElementById(id).value;
  const report = {
    name: value("reportName"), category: value("reportCategory"),
    location: value("reportLocation"), description: value("reportDescription"),
    date: value("reportDate"), email: value("reportEmail")
  };
  if (Object.values(report).some(v => !v.trim()))
    return showToast("Please fill in all fields.");
  if (!report.email.includes("@"))
    return showToast("Please enter a valid email.");
  try {
    if (reportPhotoFile) report.image = await resizeReportPhoto(reportPhotoFile);
    const item = await api("/items", "POST", report);
    closeReportModal();
    await loadItems();
    showToast("✓ Item reported successfully! Item ID: " + item.id);
  } catch (e) { showToast(e.message); }
}

let reportPhotoFile = null;
let reportPhotoUrl = null;

function previewReportPhoto(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("reportPhotoPreview");
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) {
    event.target.value = "";
    reportPhotoFile = null;
    if (reportPhotoUrl) URL.revokeObjectURL(reportPhotoUrl);
    reportPhotoUrl = null;
    preview.removeAttribute("src");
    preview.hidden = true;
    showToast("Choose an image smaller than 15 MB.");
    return;
  }
  reportPhotoFile = file;
  if (reportPhotoUrl) URL.revokeObjectURL(reportPhotoUrl);
  reportPhotoUrl = URL.createObjectURL(file);
  preview.src = reportPhotoUrl;
  preview.hidden = false;
}

function resizeReportPhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.8);
      if (data.length > 1300000) return reject(new Error("That photo is too large to upload. Please choose a smaller image."));
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image."));
    };
    image.src = objectUrl;
  });
}

const closeReportModalWithoutPhotoReset = closeReportModal;
closeReportModal = function () {
  closeReportModalWithoutPhotoReset();
  reportPhotoFile = null;
  if (reportPhotoUrl) URL.revokeObjectURL(reportPhotoUrl);
  reportPhotoUrl = null;
  document.getElementById("reportPhoto").value = "";
  const preview = document.getElementById("reportPhotoPreview");
  preview.removeAttribute("src");
  preview.hidden = true;
};

async function claimCurrentItem() {
  if (!currentItem) return;
  if (!currentUser) {
    closeItemModal();
    openAuth("login");
    return showToast("Please sign in before claiming an item.");
  }
  const id = currentItem.id;
  try {
    await api(`/items/${id}/claim`, "POST");
    closeItemModal();
    await loadItems();
    showToast("Your claim has been recorded.");
  } catch (e) { showToast(e.message); }
}

/* Start-up: restore the session, then load items from the database */
(async () => {
  currentUser = null;
  localStorage.removeItem("cctcCurrentUser");
  if (token) {
    try { currentUser = (await api("/me")).user; }
    catch (e) { token = null; localStorage.removeItem("cctcToken"); }
  }
  updateAuthUI();
  renderProfile();
  try { await loadItems(); }
  catch (e) { showToast("Cannot reach the server. Is it running?"); }
})();


/* =====================================================
   OPTIONAL PROFILE PHOTO
===================================================== */

const baseRenderProfile = renderProfile;
renderProfile = function () { baseRenderProfile(); applyAvatar(); };

const baseUpdateAuthUI = updateAuthUI;
updateAuthUI = function () { baseUpdateAuthUI(); applyAvatar(); };

function applyAvatar() {
  const photo = currentUser && currentUser.avatar;
  ["largeAvatar", "profileButton"].forEach(id => {
    const el = document.getElementById(id);
    el.style.backgroundImage = photo ? `url("${photo}")` : "";
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    if (photo) el.textContent = "";
  });
  const box = document.getElementById("photoControls");
  if (box) {
    box.style.display = currentUser ? "block" : "none";
    document.getElementById("photoButton").textContent =
      photo ? "Change photo" : "Add profile photo (optional)";
    document.getElementById("removePhotoButton").style.display = photo ? "inline-block" : "none";
  }
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 256, canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const s = Math.min(img.width, img.height);
      canvas.getContext("2d").drawImage(
        img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function savePhoto(avatar) {
  try {
    currentUser = (await api("/profile/photo", "POST", { avatar })).user;
    renderProfile();
    updateAuthUI();
    showToast(avatar ? "Profile photo updated." : "Profile photo removed.");
  } catch (e) { showToast(e.message); }
}

(function addPhotoControls() {
  const box = document.createElement("div");
  box.id = "photoControls";
  box.style.cssText = "display:none;margin-bottom:14px";
  box.innerHTML = `
    <input type="file" id="photoInput" accept="image/*" style="display:none">
    <button class="auth-button" id="photoButton" type="button"></button>
    <button class="logout-button" id="removePhotoButton" type="button"
            style="display:none;margin-left:8px">Remove</button>`;
  const card = document.querySelector(".profile-card");
  card.insertBefore(box, document.getElementById("logoutButton"));

  document.getElementById("photoButton").onclick =
    () => document.getElementById("photoInput").click();
  document.getElementById("removePhotoButton").onclick = () => savePhoto(null);
  document.getElementById("photoInput").onchange = async event => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    try { savePhoto(await resizeImage(file)); }
    catch (e) { showToast("Could not read that image."); }
  };
  applyAvatar();
})();
