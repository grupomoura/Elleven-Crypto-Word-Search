const gameAudio = {
    select: new Audio('sounds/select.mp3'),
    found: new Audio('sounds/found.mp3'),
    complete: new Audio('sounds/complete.mp3'),
    error: new Audio('sounds/error.mp3')
};

// Ajustar volume
Object.values(gameAudio).forEach(audio => {
    audio.volume = 0.3;
}); 