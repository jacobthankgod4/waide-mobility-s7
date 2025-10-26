// Clean script without counter animation
document.addEventListener('DOMContentLoaded', () => {
    // Basic navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Video play button
    const playButton = document.getElementById('playButton');
    const video = document.getElementById('howItWorksVideo');
    
    if (playButton && video) {
        playButton.addEventListener('click', () => {
            video.play();
            playButton.style.opacity = '0';
        });
    }
    
    console.log('Page loaded successfully');
});