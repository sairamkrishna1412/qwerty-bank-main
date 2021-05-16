import axios from "axios";
import { alert } from "./alert";

export const updateUser = async function (type, data) {
    try {
        if (type === "auth") {
            const sp = document.querySelector(".btn-text-sp");
            sp.textContent = "";
            sp.nextElementSibling.style.display = "inline-block";
        }
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
        const sp = document.querySelector(".btn-text-sp");
        sp.textContent = "save password";
        sp.nextElementSibling.style.display = "none";
        alert("error", err.response.data.message);
        // console.log(err.response);
    }
};
