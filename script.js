const shootBtn = document.getElementById("shootBtn");
const ravana = document.querySelector(".ravana");
const rama = document.querySelector(".rama");
const battlefield = document.querySelector(".battlefield");
const videoPopup = document.getElementById("video-popup");
const mainCelebrationVideo = document.getElementById("mainCelebrationVideo");
const bgVideos = videoPopup.querySelectorAll(".bg-video");
const victoryAudio = document.getElementById("victoryAudio");
const ravanInjuryAudio = document.getElementById("ravanInjuryAudio");
const arrowShootAudio = document.getElementById("arrowShootAudio");

let isRavanaDefeated = false;

shootBtn.addEventListener("click", () => {
  // Don't allow shooting more arrows if Ravana is already defeated
  if (isRavanaDefeated) return;

  // Play the arrow release sound
  arrowShootAudio.currentTime = 0;
  arrowShootAudio.play().catch(e => console.error("Arrow shoot audio play failed:", e));

  // Create a new arrow element for each shot
  const arrow = document.createElement("div");
  arrow.className = "arrow";
  battlefield.appendChild(arrow); // Append arrow to the DOM to calculate its position

  // Calculate dynamic distance for the arrow to travel
  const ravanaPosition = ravana.offsetLeft;
  // Dynamically calculate the arrow's starting point relative to Rama
  const ramaRect = rama.getBoundingClientRect();
  const battlefieldRect = battlefield.getBoundingClientRect();
  const arrowStartX = ramaRect.right - battlefieldRect.left - 35; // Adjust -35 as needed
  arrow.style.left = `${arrowStartX}px`;
  const distance = ravanaPosition - arrowStartX - 20; // -20 for a nice hit point

  // Dynamically create and inject the keyframes for responsive arrow flight
  // We create a unique animation name to avoid conflicts
  const animationName = `flyArrow_${Date.now()}`;
  const styleSheet = document.styleSheets[0];
  const keyframes = `@keyframes ${animationName} { 100% { transform: translateX(${distance}px); } }`;
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

  // 1. Start arrow animation
  arrow.style.animation = `${animationName} 2s linear forwards`;

  // 2. When arrow animation ends...
  arrow.addEventListener('animationend', function onArrowAnimationEnd() {
    // Only trigger Ravana's defeat if he hasn't been defeated yet
    if (!isRavanaDefeated) {
      isRavanaDefeated = true;
      shootBtn.disabled = true; // Disable button during final sequence
      ravanInjuryAudio.play().catch(e => console.error("Injury audio play failed:", e));
      ravana.style.animation = "ravanaHit 1.5s forwards";
    }
    // Clean up the arrow and its animation rule
    arrow.remove(); // Remove the arrow element from the DOM
    // Find and delete the correct animation rule by name
    for (let i = styleSheet.cssRules.length - 1; i >= 0; i--) {
      const rule = styleSheet.cssRules[i];
      if (rule.name === animationName) {
        styleSheet.deleteRule(i);
        break;
      }
    }
  });
});

// 3. When Ravana's animation ends, show the video popup
ravana.addEventListener('animationend', function onRavanaAnimationEnd(event) {
  // Only reset if the ravanaHit animation just finished
  if (event.animationName === 'ravanaHit') {
    videoPopup.classList.add('show');
    mainCelebrationVideo.play().catch(e => console.error("Main video play failed:", e));
    bgVideos.forEach(video => video.play().catch(e => console.error("BG video play failed:", e)));
    victoryAudio.play().catch(e => console.error("Audio play failed:", e));
  }
});

// 4. When the popup is clicked, hide it and reset the scene
videoPopup.addEventListener('click', () => {
  videoPopup.classList.remove('show');
  mainCelebrationVideo.pause();
  mainCelebrationVideo.currentTime = 0;
  bgVideos.forEach(video => {
    video.pause();
    video.currentTime = 0;
  });
  victoryAudio.pause();
  victoryAudio.currentTime = 0;
  ravanInjuryAudio.pause();
  ravanInjuryAudio.currentTime = 0;

  ravana.style.animation = "none"; // Clear animation properties
  isRavanaDefeated = false; // Allow shooting again
  shootBtn.disabled = false;
});
