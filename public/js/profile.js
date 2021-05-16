import axios from "axios";
import { alert } from "./alert";

export const updateUser = async function (type, data) {
    let button = type === "auth" ? ".btn-text-sp" : ".btn-text";
    const pressedBtn = document.querySelector(button);
    const buttonVal = pressedBtn.value;
    pressedBtn.textContent = "";
    pressedBtn.nextElementSibling.style.display = "inline-block";
    try {
        const url =
            type === "auth" ? "/users/updatePassword" : "/users/updateMe";
        const response = await axios({
            method: "patch",
            url,
            data,
        });
        if (response.data.status === "success") {
            const message =
                type === "auth" ? "Password updated." : "Details updated.";
            alert("success", message);
            location.reload();
        }
    } catch (err) {
        pressedBtn.textContent = buttonVal;
        pressedBtn.nextElementSibling.style.display = "none";
        alert("error", err.response.data.message);
        // console.log(err.response);
    }
};
