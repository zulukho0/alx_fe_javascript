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

// Add a new quote dynamically
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both quote and category.");
    return;
  }

  // Add to array
  quotes.push({ text: quoteText, category: quoteCategory });

  // Save updated quotes to localStorage
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // Clear form
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Update display
  showRandomQuote();
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

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Export quotes to JSON file
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2); // Pretty print
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url); // Clean up
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        throw new Error("Invalid format: expected an array.");
      }

      const validQuotes = importedQuotes.filter(q => q.text && q.category);
      quotes.push(...validQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
      showRandomQuote(); // Refresh display
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}


// Initialize
newQuoteBtn.addEventListener("click", showRandomQuote);
createAddQuoteForm();
restoreLastViewedQuote();
document.getElementById("exportBtn").addEventListener("click", exportQuotesToJson);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

