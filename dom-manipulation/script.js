// Load quotes from localStorage or use default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Humor" },
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Inspiration" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available.</em>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

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

  quotes.push({ text: quoteText, category: quoteCategory });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  showRandomQuote();
  populateCategories(); // ✅ update categories if new added
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
      populateCategories(); // ✅ refresh categories too
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
    filterQuotes(); // immediately apply
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

// Initialize
newQuoteBtn.addEventListener("click", showRandomQuote);
createAddQuoteForm();
populateCategories();   // ✅ initialize filter dropdown
restoreLastViewedQuote();