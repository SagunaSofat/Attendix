/* ================= ATTENDIX JAVASCRIPT ================= */

const TARGET_KEY = "attendixTarget";
const RECORDS_KEY = "attendixRecords";
const USER_KEY = "attendixUser";
const SESSION_KEY = "attendixLoggedIn";

const defaultRecords = [
    { date: "2026-09-02", subject: "Web Development", time: "10:00", status: "Present" },
    { date: "2026-09-03", subject: "Web Development", time: "10:00", status: "Present" },
    { date: "2026-09-04", subject: "Web Development", time: "10:00", status: "Absent" },
    { date: "2026-09-05", subject: "Web Development", time: "10:00", status: "Present" },
    { date: "2026-09-07", subject: "Web Development", time: "10:00", status: "Present" },
    { date: "2026-09-08", subject: "Web Development", time: "10:00", status: "Present" },
    { date: "2026-09-09", subject: "Web Development", time: "10:00", status: "Absent" }
];

function getRecords() {
    try {
        const saved = localStorage.getItem(RECORDS_KEY);

        if (saved === null) {
            localStorage.setItem(RECORDS_KEY, JSON.stringify(defaultRecords));
            return [...defaultRecords];
        }

        const records = JSON.parse(saved);
        return Array.isArray(records) ? records : [...defaultRecords];
    } catch {
        return [...defaultRecords];
    }
}

function saveRecords(records) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

function getTarget() {
    const target = Number(localStorage.getItem(TARGET_KEY) || 75);
    return target >= 1 && target <= 100 ? target : 75;
}

function getAttendance(records) {
    const total = records.length;
    const present = records.filter(record => record.status === "Present").length;

    return {
        total,
        present,
        absent: total - present,
        percentage: total ? Math.round((present / total) * 100) : 0
    };
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function showMessage(message) {
    alert(message);
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
}

/* ================= DATE HELPERS ================= */

function toISODate(dateValue) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }

    const parsed = new Date(dateValue);

    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
    const isoDate = toISODate(dateValue);
    if (!isoDate) return dateValue;

    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getDay(dateValue) {
    const isoDate = toISODate(dateValue);
    if (!isoDate) return "—";

    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        weekday: "long"
    });
}

function formatTime(timeValue) {
    if (!timeValue) return "—";

    const parts = timeValue.split(":");
    if (parts.length !== 2) return timeValue;

    let hours = Number(parts[0]);
    const minutes = parts[1];
    const suffix = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${suffix}`;
}

/* ================= LOADER AND WELCOME ================= */

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    if (loader) {
        setTimeout(() => {
            loader.style.display = "none";
        }, 2200);
    }

    updateWelcomeMessage();
});

function updateWelcomeMessage() {
    const heading = document.querySelector(".welcome h1");
    const user = getUser();

    if (heading && user) {
        heading.textContent = `Welcome back, ${user.name || "Student"}!`;
    }
}

/* ================= LOGIN ================= */

const loginButton = document.querySelector(".login-submit");

if (loginButton) {
    loginButton.addEventListener("click", event => {
        event.preventDefault();

        const form = loginButton.closest("form");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!form || !form.reportValidity()) return;

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const user = getUser();

        if (!user) {
            showMessage("No account found. Please select Create Account first.");
            return;
        }

        if (user.email !== email || user.password !== password) {
            showMessage("Incorrect email or password. Please try again.");
            return;
        }

        sessionStorage.setItem(SESSION_KEY, "true");

        const remember = document.querySelector(
            '.remember input[type="checkbox"]'
        );

        if (remember && remember.checked) {
            localStorage.setItem("attendixRememberedEmail", email);
        } else {
            localStorage.removeItem("attendixRememberedEmail");
        }

        window.location.href = "dashboard.html";
    });
}

/* ================= REMEMBER ME ================= */

const emailField = document.getElementById("email");

if (emailField) {
    const rememberedEmail = localStorage.getItem("attendixRememberedEmail");

    if (rememberedEmail) {
        emailField.value = rememberedEmail;

        const remember = document.querySelector(
            '.remember input[type="checkbox"]'
        );

        if (remember) remember.checked = true;
    }
}

/* ================= CREATE ACCOUNT ================= */

const signupLink = document.querySelector(".signup a");

if (signupLink) {
    signupLink.addEventListener("click", event => {
        event.preventDefault();

        const existingUser = getUser();

        if (existingUser && !confirm(
            "An account already exists in this browser. Create a new demo account?"
        )) {
            return;
        }

        const name = prompt("Enter your full name:");
        if (!name || !name.trim()) {
            showMessage("Please enter your name.");
            return;
        }

        const email = prompt("Enter your email address:");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            showMessage("Please enter a valid email address.");
            return;
        }

        const password = prompt("Create a password with at least 6 characters:");
        if (!password || password.length < 6) {
            showMessage("Password must contain at least 6 characters.");
            return;
        }

        localStorage.setItem(USER_KEY, JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password
        }));

        showMessage("Account created successfully! You can now log in.");

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (emailInput) emailInput.value = email.trim();
        if (passwordInput) passwordInput.value = "";
    });
}

/* ================= FORGOT PASSWORD ================= */

const forgotLink = document.querySelector(".forgot");

if (forgotLink) {
    forgotLink.addEventListener("click", event => {
        event.preventDefault();

        const email = prompt("Enter your registered email address:");
        if (!email) return;

        const user = getUser();

        if (!user || user.email !== email.trim().toLowerCase()) {
            showMessage("No account found with this email address.");
            return;
        }

        showMessage(
            "Demo account found. Password reset is not connected to an email service."
        );
    });
}

/* ================= LOGOUT ================= */

document.querySelectorAll(".logout").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = "login.html";
    });
});

/* ================= DASHBOARD ================= */

function updateDashboard() {
    const welcome = document.querySelector(".welcome");
    const subjectTable = document.querySelector(".section table");

    if (!welcome || !subjectTable) return;

    const records = getRecords();
    const stats = getAttendance(records);
    const target = getTarget();

    const percentage = document.querySelector(".attendance-card .percentage");

    if (percentage) {
        percentage.textContent = stats.percentage + "%";
    }

    const attendanceCard = document.querySelector(".attendance-card");

    if (attendanceCard) {
        const description = attendanceCard.querySelector("p");
        const status = attendanceCard.querySelector(".status");

        if (description) {
            description.textContent = stats.percentage >= target
                ? "Your attendance is above the required percentage."
                : "Your attendance is below the required percentage.";
        }

        if (status) {
            status.textContent = stats.percentage >= target
                ? "Above Target"
                : "Below Target";

            status.style.color = stats.percentage >= target
                ? "#2d8a52"
                : "#d05b5b";
        }
    }

    const summaryCards = document.querySelectorAll(".summary-card h2");

    if (summaryCards.length >= 3) {
        summaryCards[0].textContent = stats.total;
        summaryCards[1].textContent = stats.present;
        summaryCards[2].textContent = stats.absent;
    }

    const targetSection = Array.from(document.querySelectorAll(".section"))
        .find(section => section.textContent.includes("Attendance Target"));

    if (targetSection) {
        const targetText = targetSection.querySelector(".target-box p");
        const percentageText = targetSection.querySelector(".target-percentage");
        const progress = targetSection.querySelector(".progress-bar");

        if (targetText) {
            targetText.textContent = `Required attendance: ${target}%`;
        }

        if (percentageText) {
            percentageText.textContent = stats.percentage + "%";
        }

        if (progress) {
            progress.style.width = stats.percentage + "%";
        }

        if (!document.getElementById("changeTarget")) {
            const button = document.createElement("button");
            button.id = "changeTarget";
            button.textContent = "Change Target";
            button.className = "primary-btn";
            button.style.marginTop = "18px";
            button.style.border = "none";
            button.style.cursor = "pointer";
            button.addEventListener("click", changeTarget);
            targetSection.appendChild(button);
        }
    }

    updateSubjectTable(records);
}

function updateSubjectTable(records) {
    const table = document.querySelector(".section table");
    if (!table) return;

    table.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());

    const subjects = {};

    records.forEach(record => {
        if (!subjects[record.subject]) {
            subjects[record.subject] = { total: 0, present: 0 };
        }

        subjects[record.subject].total++;

        if (record.status === "Present") {
            subjects[record.subject].present++;
        }
    });

    Object.entries(subjects).forEach(([subject, data]) => {
        const absent = data.total - data.present;
        const percentage = Math.round((data.present / data.total) * 100);
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(subject)}</td>
            <td>${data.total}</td>
            <td>${data.present}</td>
            <td>${absent}</td>
            <td>${percentage}%</td>
            <td class="${percentage >= getTarget() ? "good" : "low"}">
                ${percentage >= getTarget() ? "Good" : "Low"}
            </td>
        `;

        table.appendChild(row);
    });
}

function changeTarget() {
    const answer = prompt(
        "Enter your target attendance percentage (1–100):",
        String(getTarget())
    );

    if (answer === null) return;

    const target = Number(answer);

    if (!Number.isFinite(target) || target < 1 || target > 100) {
        showMessage("Please enter a number between 1 and 100.");
        return;
    }

    localStorage.setItem(TARGET_KEY, String(target));
    updateDashboard();
    showMessage("Attendance target updated successfully!");
}

/* ================= ATTENDANCE RECORDS ================= */

function renderRecords() {
    const tableBody = document.getElementById("recordsTableBody");
    if (!tableBody) return;

    const records = getRecords();
    const stats = getAttendance(records);

    const overall = document.getElementById("overallAttendance");
    const present = document.getElementById("classesPresent");
    const absent = document.getElementById("classesAbsent");

    if (overall) overall.textContent = stats.percentage + "%";
    if (present) present.textContent = stats.present;
    if (absent) absent.textContent = stats.absent;

    tableBody.innerHTML = "";

    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No attendance records yet. Add your first record above.
                </td>
            </tr>
        `;
        return;
    }

    records.forEach((record, index) => {
        const row = document.createElement("tr");
        const statusClass = record.status === "Present" ? "present" : "absent";
        const statusText = record.status === "Present" ? "✓ Present" : "✕ Absent";

        row.innerHTML = `
            <td>${escapeHTML(formatDate(record.date))}</td>
            <td>${escapeHTML(getDay(record.date))}</td>
            <td>${escapeHTML(record.subject)}</td>
            <td>${escapeHTML(formatTime(record.time))}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button type="button" class="toggle-record" data-index="${index}">
                    Change
                </button>
                <button type="button" class="delete-record" data-index="${index}">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

/* ================= ADD RECORD FORM ================= */

const attendanceForm = document.getElementById("attendanceForm");

if (attendanceForm) {
    const dateInput = document.getElementById("recordDate");

    // Default the calendar to today's date.
    if (dateInput && !dateInput.value) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        dateInput.value = `${year}-${month}-${day}`;
    }

    attendanceForm.addEventListener("submit", event => {
        event.preventDefault();

        const subject = document.getElementById("recordSubject").value;
        const date = document.getElementById("recordDate").value;
        const time = document.getElementById("recordTime").value;
        const status = document.getElementById("recordStatus").value;

        if (!subject || !date || !time || !status) {
            showMessage("Please fill in all the fields.");
            return;
        }

        const records = getRecords();

        records.push({
            subject,
            date,
            time,
            status
        });

        saveRecords(records);
        renderRecords();
        attendanceForm.reset();

        // Set today's date again after resetting the form.
        if (dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            dateInput.value = `${year}-${month}-${day}`;
        }

        document.getElementById("recordTime").value = "10:00";
        showMessage("Attendance record added successfully!");
    });
}

/* ================= CHANGE OR DELETE RECORD ================= */

document.addEventListener("click", event => {
    const toggleButton = event.target.closest(".toggle-record");
    const deleteButton = event.target.closest(".delete-record");

    if (toggleButton) {
        const index = Number(toggleButton.dataset.index);
        const records = getRecords();

        if (!records[index]) return;

        records[index].status = records[index].status === "Present"
            ? "Absent"
            : "Present";

        saveRecords(records);
        renderRecords();
    }

    if (deleteButton) {
        const index = Number(deleteButton.dataset.index);

        if (!confirm("Are you sure you want to delete this record?")) {
            return;
        }

        const records = getRecords();
        records.splice(index, 1);

        saveRecords(records);
        renderRecords();
    }
});

/* ================= ATTENDANCE CALCULATOR ================= */

function openCalculator() {
    const attended = prompt("How many classes have you attended?");
    if (attended === null) return;

    const total = prompt("How many classes have been held in total?");
    if (total === null) return;

    const present = Number(attended);
    const totalClasses = Number(total);

    if (
        attended.trim() === "" ||
        total.trim() === "" ||
        !Number.isInteger(present) ||
        !Number.isInteger(totalClasses) ||
        present < 0 ||
        totalClasses <= 0 ||
        present > totalClasses
    ) {
        showMessage("Enter valid class counts. Attended cannot exceed total.");
        return;
    }

    const percentage = (present / totalClasses) * 100;
    const target = getTarget();

    let message =
        `Your attendance is ${percentage.toFixed(2)}%.\n` +
        `Your target is ${target}%.`;

    if (percentage >= target) {
        message += "\nYou are meeting your target.";
    } else if (target < 100) {
        const required = Math.ceil(
            (target * totalClasses - 100 * present) / (100 - target)
        );

        message +=
            `\nYou need to attend approximately ${Math.max(0, required)} ` +
            "consecutive classes to reach your target without missing any.";
    }

    showMessage(message);
}

document.querySelectorAll(".main-buttons .primary-btn, .cta .primary-btn")
    .forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            openCalculator();
        });
    });

/* ================= HOMEPAGE FEATURE LINKS ================= */

document.querySelectorAll(".feature-card a").forEach((link, index) => {
    link.addEventListener("click", event => {
        event.preventDefault();

        if (index === 0) {
            window.location.href = "attendance.html";
        } else if (index === 1) {
            openCalculator();
        } else {
            showMessage(
                "Your attendance target is " + getTarget() +
                "%. Check the dashboard to review your attendance."
            );
        }
    });
});

/* ================= FOOTER LINKS ================= */

document.querySelectorAll(".footer-column a").forEach(link => {
    const text = link.textContent.trim().toLowerCase();

    if (text === "home") link.href = "website.html";
    if (text === "features") link.href = "website.html#features";
    if (text === "benefits") link.href = "website.html#benefits";
    if (text === "about") link.href = "about.html";
    if (text.includes("tracking")) link.href = "attendance.html";

    if (text.includes("calculator") || text.includes("target")) {
        link.href = "website.html#features";
    }

    if (text.includes("reports")) link.href = "dashboard.html";
});

document.querySelectorAll('a[href="#"]').forEach(link => {
    if (
        link.classList.contains("signup") ||
        link.classList.contains("forgot") ||
        link.classList.contains("primary-btn") ||
        link.classList.contains("secondary-btn") ||
        link.closest(".feature-card")
    ) {
        return;
    }

    link.addEventListener("click", event => {
        const text = link.textContent.trim().toLowerCase();

        if (text.includes("privacy") || text.includes("terms")) {
            event.preventDefault();
            showMessage(
                "This is a frontend demo. A full privacy policy and terms page have not been configured."
            );
        }
    });
});

/* ================= PAGE INITIALIZATION ================= */

if (
    document.querySelector(".welcome") &&
    document.querySelector(".attendance-card")
) {
    updateDashboard();
}

if (document.getElementById("recordsTableBody")) {
    renderRecords();
}