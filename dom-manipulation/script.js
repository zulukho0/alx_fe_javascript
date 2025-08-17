// Load quotes from localStorage or use default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation", source: "default", lastModified: new Date().toISOString() },
  { id: 2, text: "Be yourself; everyone else is already taken.", category: "Humor", source: "default", lastModified: new Date().toISOString() },
  { id: 3, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", source: "default", lastModified: new Date().toISOString() },
  { id: 4, text: "Life is what happens when you're busy making other plans.", category: "Life", source: "default", lastModified: new Date().toISOString() },
  { id: 5, text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Inspiration", source: "default", lastModified: new Date().toISOString() }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Show a random quote (respects active filter)
function showRandomQuote() {
  const categoryFilter = document.getElementById("categoryFilter");
  let quotesToShow = quotes;

  // Apply filter if one is selected
  if (categoryFilter && categoryFilter.value !== "all") {
    quotesToShow = quotes.filter(q => q.category === categoryFilter.value);
  }

  if (quotesToShow.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available.</em>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotesToShow.length);
  const quote = quotesToShow[randomIndex];

  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Add a new quote dynamically
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = {
    id: Date.now(), // Simple ID generation
    text: quoteText,
    category: quoteCategory,
    lastModified: new Date().toISOString(),
    source: "local"
  };

  quotes.push(newQuote);
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  showRandomQuote();
  populateCategories();

  // 🔹 Simulate posting to server as well
  postQuoteToServer(newQuote);
}

// Export quotes to JSON file
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        throw new Error("Invalid format: expected an array.");
      }

      const validQuotes = importedQuotes.filter(q => q.text && q.category);
      quotes.push(...validQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
      showRandomQuote();
      populateCategories();
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Create the quote submission form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "quoteFormContainer";

  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.body.appendChild(formContainer);

  // Move export and file elements into the form
  const exportBtn = document.getElementById("exportBtn");
  const importFile = document.getElementById("importFile");
  if (exportBtn && importFile) {
    const fileControls = document.createElement("div");
    fileControls.id = "fileControls";
    fileControls.appendChild(exportBtn);
    fileControls.appendChild(importFile);
    formContainer.appendChild(fileControls);
  }

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFile.addEventListener("change", importFromJsonFile);
}

// Restore last viewed quote from sessionStorage
function restoreLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
  } else {
    showRandomQuote();
  }
}

/* ------------------------------
   CATEGORY FILTERING FUNCTIONS
--------------------------------*/

// Populate category filter dropdown dynamically
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;

  filter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && [...filter.options].some(opt => opt.value === savedFilter)) {
    filter.value = savedFilter;
    filterQuotes();
  }
}

// Apply selected filter to quotes
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);

  if (category === "all") {
    showRandomQuote();
  } else {
    const filtered = quotes.filter(q => q.category === category);
    if (filtered.length === 0) {
      quoteDisplay.innerHTML = `<em>No quotes in this category.</em>`;
    } else {
      const q = filtered[Math.floor(Math.random() * filtered.length)];
      quoteDisplay.innerHTML = `<p>"${q.text}"</p><small>— ${q.category}</small>`;
      sessionStorage.setItem("lastQuote", JSON.stringify(q));
    }
  }
}

/* ------------------------------
   SERVER SIMULATION FUNCTIONS
--------------------------------*/

// Base URL for simulated server
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// Simulate fetching quotes from server with conflict resolution
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const serverQuotes = data.slice(0, 10).map(item => ({
      id: item.id,
      text: item.title,
      category: "Server",
      lastModified: new Date().toISOString(),
      source: "server"
    }));

    // Keep local (non-server) quotes intact
    const localQuotes = quotes.filter(q => q.source !== "server");

    // MERGE: server always refreshes, locals always persist
    quotes = [...localQuotes, ...serverQuotes];

    saveQuotes();
    populateCategories();   // dropdown will now include all categories present
    showRandomQuote();
    console.log("Quotes synced: local + server merged, server refreshed.", quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

// Simulate posting a new quote to server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();
    console.log("Posted new quote (simulated):", result);
  } catch (error) {
    console.error("Error posting new quote:", error);
  }
}

// Initialize
newQuoteBtn.addEventListener("click", showRandomQuote);
createAddQuoteForm();
populateCategories();
restoreLastViewedQuote();

// Periodically fetch from server (every 30 seconds, for demo)
setInterval(fetchQuotesFromServer, 30000);

// Initial fetch when page loads
fetchQuotesFromServer();