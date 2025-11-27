// reusable header & footer

function loadHTML(id, filePath) {
  const placeholder = document.getElementById(id);
  if (placeholder) {
    fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        placeholder.innerHTML = data;
      })
      .catch((error) => console.error("Error loading component:", error));
  }
}

// Call the function for both components when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadHTML("header-placeholder", "header.html");
  loadHTML("footer-placeholder", "footer.html");
});
