document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('status');
  const resultContainer = document.getElementById('result');
  const timeVal = document.getElementById('time-val');

  // 1. Get the currently active browser tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.id || tab.url.startsWith('chrome://')) {
    statusText.innerText = "Cannot scan this type of page.";
    return;
  }

  // 2. Inject a script into the active tab to extract text and count words
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Grab all visible text content from the body element
      const text = document.body.innerText || "";
      // Split by spaces to find individual words, filtering out empty strings
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      return words.length;
    }
  }, (results) => {
    if (!results || !results[0]) {
      statusText.innerText = "Failed to scan the page text.";
      return;
    }

    const wordCount = results[0].result;
    
    // 3. Calculate reading time (Average human reading speed is ~200 WPM)
    const wordsPerMinute = 200;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    // 4. Update the UI
    statusText.style.display = 'none';
    resultContainer.style.display = 'block';
    timeVal.innerText = readingTime === 0 ? "Less than 1" : readingTime;
  });
});
