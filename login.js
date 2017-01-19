'use strict';
function login(){
    fadeEffect('#modal');

    setTimeout(function(){ 
        window.location.href = "assignment.html";
    }, 3200);
    return false;
}

function fadeEffect(target) {
    var fadeTarget = document.querySelector(target);
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity < 0.1) {
            fadeTarget.style.display = 'none';
            document.getElementById('loader').style.display = 'block'; 
            clearInterval(fadeEffect);
        } else {
            fadeTarget.style.opacity -= 0.05;
        }
    }, 15);
} 