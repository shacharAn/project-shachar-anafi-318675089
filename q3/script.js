document.addEventListener("DOMContentLoaded",()=>
{
    const form = document.getElementById("report-form");
    const messageBox = document.getElementById("message");
    if (form) {
        form.addEventListener("submit", function (e) {
        e.preventDefault();

        messageBox.innerHTML ="";
        messageBox.className ="";

        const result = validateForm();
        if (result.valid) {
        const item = {
            id: Date.now().toString(),
            tunnel: document.getElementById("canal").value.trim(),
            targetTime: document.getElementById("targetTime").value,
            actualTime: document.getElementById("actualTime").value,
            description: document.getElementById("issue").value.trim(),
            multiCrossing: document.getElementById("multiple").value === "yes",
            securityCode: document.getElementById("security").value.trim(),
            email: document.getElementById("email").value.trim(),
            status: "פתוחה" 
        };
        saveItem(item);
        messageBox.classList.add("success");
        messageBox.textContent = "הדיווח נשלח בהצלחה!";
        form.reset();
    
        setTimeout(() => {
        window.location.href = "view.html";
    }, 1500);
        } else {
        messageBox.classList.add("error");
        result.errors.forEach(err => {
            const p = document.createElement("p");
            p.innerText = err;
            messageBox.appendChild(p);
        });
    }
    });
}
if (document.getElementById("time-faults-list")) {
    loadItems();
}
});
function saveItem(item) {
    const current = JSON.parse(localStorage.getItem("timeBugs")) || [];
    current.push(item);
    localStorage.setItem("timeBugs", JSON.stringify(current));
}
        function validateForm() {
        const errors = [];
        const canal = document.getElementById("canal").value.trim();
        if (!canal) {
            errors.push("יש למלא מספר תעלה.");
        } else if (isNaN(canal) || parseInt(canal) <= 0) {
            errors.push("מספר תעלה חייב להיות מספר חיובי (מעל 0).");
        }
        const targetTime = document.getElementById("targetTime").value;
        const landingTime = document.getElementById("actualTime").value;
        const description = document.getElementById("issue").value.trim();
        const crossed = document.getElementById("multiple").value==="yes";
        const email = document.getElementById("email").value.trim();

        if (!canal) {
            errors.push("יש למלא מספר תעלה.");
        }
        if (!email) {
            errors.push("יש למלא כתובת אימייל.");
        } else if (!validateEmail(email)) {
            errors.push("כתובת האימייל אינה תקינה.");
        }
        if (targetTime && landingTime && targetTime > landingTime) {
            errors.push("זמן היעד לא יכול להיות אחרי זמן הנחיתה.");
        }
        if (description.length > 250) {
            errors.push("תיאור התקלה ארוך מדי (מעל 250 תווים).");
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }


function validateEmail(email) {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
}
function loadItems() {
    const items = JSON.parse(localStorage.getItem("timeBugs")) || [];
    renderItems(items);
    calculateAverageDelay(items);
    
}
document.getElementById("filter").addEventListener("change", function () {
    filterItems(this.value);
});

function renderItems(items) {
    const container = document.getElementById("time-faults-list");
    if (!container) return;
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>תעלה: ${item.tunnel}</h3>
            <p><strong>יעד:</strong> ${item.targetTime}</p>
            <p><strong>נחיתה:</strong> ${item.actualTime}</p>
            <p><strong>תקלה:</strong> ${item.description}</p>
            <p><strong>האם יותר מאדם אחד חצה?</strong> ${item.multiCrossing ? "כן" : "לא"}</p>
            <p><strong>אבטחה:</strong> ${item.securityCode}</p>
            <p><strong>מייל:</strong> ${item.email}</p>
            <p><strong>סטטוס:</strong> <span class="status ${item.status === "טופלה" ? "done" : "open"}">${item.status}</span></p>
            <button onclick="updateItem('${item.id}')">שנה סטטוס</button>
            <button onclick="deleteItem('${item.id}')">מחק</button>
        `;

        container.appendChild(card);
    });
}
function deleteItem(id) {
    let items = JSON.parse(localStorage.getItem("timeBugs")) || [];
    items = items.filter((item) => item.id !== id);
    localStorage.setItem("timeBugs", JSON.stringify(items));
    renderItems(items);
    calculateAverageDelay(items);
}
function updateItem(id) {
    let items = JSON.parse(localStorage.getItem("timeBugs")) || [];
    items = items.map((item) => {
        if (item.id === id) {
        item.status = item.status === "פתוחה" ? "טופלה" : "פתוחה";
        }
        return item;
    });
    localStorage.setItem("timeBugs", JSON.stringify(items));
    renderItems(items);
}

function calculateAverageDelay(items) {
    const delayContainer = document.getElementById("average-delay");
    if (!delayContainer) return;

    if (items.length === 0) {
        delayContainer.textContent = "אין תקלות לחישוב סטייה.";
        return;
    }

    let totalDiff = 0;
    let count = 0;

    items.forEach((item) => {
        const target = new Date("2000-01-01T" + item.targetTime);
        const actual = new Date("2000-01-01T" + item.actualTime);
        const diff = Math.abs(actual - target) / 60000; // דקות
        if (!isNaN(diff)) {
        totalDiff += diff;
        count++;
        }
    });

    const avg = count > 0 ? (totalDiff / count).toFixed(1) : 0;
    delayContainer.textContent = `ממוצע סטיית זמן: ${avg} דקות`;
}
function filterItems(type) {
    const allItems = JSON.parse(localStorage.getItem("timeBugs")) || [];

    if (type === "all") {
        renderItems(allItems);
        calculateAverageDelay(allItems);
        return;
    }

    const filtered = allItems.filter(item => item.description === type);
    renderItems(filtered);
    calculateAverageDelay(filtered);
}
