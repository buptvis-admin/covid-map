function showHint(content, state) {
    let updateHint = document.getElementById('update-hint')
    updateHint.innerHTML = content
    if (state) {
        updateHint.style.color = 'green'
    } else {
        updateHint.style.color = '#db5454'       
    }
    updateHint.style.opacity = 1
    setTimeout(function() {
        updateHint.style.opacity = 0
    },2000)
}