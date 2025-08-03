let i = 0;
const text = "Welcome to Portfolio Management";
const typingSpeed = 200;
let activeTimeout = null;
let isActive = false;

export default function typeWriter() {
    if (isActive) {
        if (activeTimeout) {
            clearTimeout(activeTimeout);
        }
        const typingElement = document.getElementById("typing");
        if (typingElement) {
            typingElement.innerHTML = '';
        }
        i = 0;
    }

    isActive = true;
    const typingElement = document.getElementById("typing");
    if (!typingElement) return;
    
    function type() {
        if (!typingElement || !isActive) return;
        
        if (i < text.length) {
            typingElement.innerHTML += text.charAt(i);
            i++;
            activeTimeout = setTimeout(type, typingSpeed);
        } else {
            clearTimeout(activeTimeout);
        }
    }
    
    type();
    

    return () => {
        isActive = false;
        if (activeTimeout) {
            clearTimeout(activeTimeout);
        }
        if (typingElement) {
            typingElement.innerHTML = '';
        }
        i = 0;
    };
}
