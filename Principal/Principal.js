document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll('.menu a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`Has seleccionado ${item.textContent}`);
            // Aquí podrías agregar más lógica para navegar si es necesario.
        });
    });
});
