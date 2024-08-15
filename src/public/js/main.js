$(document).ready(function () {
  // Function to update the active link
  function updateActiveLink() {
    // Get the current URL pathname
    const path = window.location.pathname;

    // Remove active class from all links
    $(".nav-link").removeClass("active");

    // Add active class to the link that matches the current URL pathname
    $(`.nav-link[href="${path}"]`).addClass("active");
  }

  // Update active link on page load
  updateActiveLink();

  // Handle click events on nav links
  $(".nav-link").on("click", function () {
    // Remove active class from all links
    $(".nav-link").removeClass("active");

    // Add active class to the clicked link
    $(this).addClass("active");
  });

  // Optionally update active link on hash change (for anchor links)
  $(window).on("popstate", updateActiveLink);
});
