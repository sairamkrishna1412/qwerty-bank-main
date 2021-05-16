export const alert = function (type, message, time = 5) {
    const color = type === "error" ? "alert-red" : "alert-green";
    const alertBox = document.createElement("div");
    alertBox.classList.add("alert-box", color);
    alertBox.innerHTML = `<p class="alert-message">${message}</p>`;
    // alertBox.innerHTML = message;
    document.body.prepend(alertBox);

    window.setTimeout(() => {
        alertBox.remove();
    }, time * 1000);
};
