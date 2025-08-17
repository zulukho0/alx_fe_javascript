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

// Show sync status notification
function showSyncStatus(message, type = "info") {
  const statusDiv = document.getElementById("syncStatus");
  if (!statusDiv) return; // If element doesn't exist, skip
  
  statusDiv.textContent = message;
  statusDiv.className = type ? type : "info";
  statusDiv.style.display = "block";

  // Hide after 5s automatically
  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 5000);
}

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
  showSyncStatus("New quote added and synced to server.", "info");
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

      const validQuotes = importedQuotes.filter(q => q.text && q.category).map(q => ({
        ...q,
        id: q.id || Date.now() + Math.random(),
        source: q.source || "imported",
        lastModified: q.lastModified || new Date().toISOString()
      }));
      
      quotes.push(...validQuotes);
      saveQuotes();
      showSyncStatus(`${validQuotes.length} quotes imported successfully!`, "info");
      showRandomQuote();
      populateCategories();
    } catch (err) {
      showSyncStatus("Failed to import quotes: " + err.message, "warning");
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
  if (exportBtn) exportBtn.addEventListener("click", exportQuotesToJson);
  if (importFile) importFile.addEventListener("change", importFromJsonFile);
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
   CONFLICT RESOLUTION FUNCTIONS
--------------------------------*/

// Manual conflict resolution - user chooses which version to keep
function resolveConflict(localQuote, serverQuote) {
  const choice = confirm(
    `Conflict detected for quote ID ${localQuote.id}!\n\n` +
    `Local version: "${localQuote.text}"\n` +
    `Category: ${localQuote.category}\n` +
    `Last modified: ${new Date(localQuote.lastModified).toLocaleString()}\n\n` +
    `Server version: "${serverQuote.text}"\n` +
    `Category: ${serverQuote.category}\n` +
    `Last modified: ${new Date(serverQuote.lastModified).toLocaleString()}\n\n` +
    `Click OK to keep Server's version, Cancel to keep Local version.`
  );

  return choice ? serverQuote : localQuote;
}

// Advanced merge with conflict detection
function mergeQuotesWithConflictResolution(localQuotes, serverQuotes) {
  let conflictsResolved = 0;
  
  // Handle conflicts for quotes that exist in both local and server
  const mergedQuotes = localQuotes.map(localQuote => {
    const serverConflict = serverQuotes.find(sq => sq.id === localQuote.id);
    
    if (serverConflict) {
      // Check if there's actually a conflict (different content or modification time)
      const hasConflict = localQuote.text !== serverConflict.text || 
                         localQuote.category !== serverConflict.category ||
                         new Date(localQuote.lastModified) !== new Date(serverConflict.lastModified);
      
      if (hasConflict) {
        conflictsResolved++;
        return resolveConflict(localQuote, serverConflict);
      }
    }
    
    return localQuote;
  });

  // Add server quotes that don't exist locally
  const newServerQuotes = serverQuotes.filter(sq => !localQuotes.some(lq => lq.id === sq.id));
  const finalQuotes = [...mergedQuotes, ...newServerQuotes];

  return { quotes: finalQuotes, conflictsResolved, newFromServer: newServerQuotes.length };
}

/* ------------------------------
   SERVER SIMULATION FUNCTIONS
--------------------------------*/

// Base URL for simulated server
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// Simulate fetching quotes from server with advanced conflict resolution
async function fetchQuotesFromServer() {
  try {
    showSyncStatus("Syncing with server...", "info");
    
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

    // Use advanced merge with conflict resolution
    const mergeResult = mergeQuotesWithConflictResolution(localQuotes, serverQuotes);
    
    quotes = mergeResult.quotes;
    saveQuotes();
    populateCategories();
    showRandomQuote();

    // Show detailed sync status
    let statusMessage = "Quotes synced successfully!";
    if (mergeResult.conflictsResolved > 0) {
      statusMessage += ` ${mergeResult.conflictsResolved} conflict(s) resolved.`;
    }
    if (mergeResult.newFromServer > 0) {
      statusMessage += ` ${mergeResult.newFromServer} new quote(s) from server.`;
    }
    
    showSyncStatus(statusMessage, mergeResult.conflictsResolved > 0 ? "warning" : "info");
    console.log("Sync completed:", mergeResult);
    
  } catch (error) {
    console.error("Error fetching quotes:", error);
    showSyncStatus("Failed to sync with server. Please try again.", "warning");
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
    showSyncStatus("Failed to sync new quote to server.", "warning");
  }
}

// Manual sync button functionality
function manualSync() {
  fetchQuotesFromServer();
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