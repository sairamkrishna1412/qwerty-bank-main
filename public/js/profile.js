import axios from "axios";

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
        if (response.data.status === "success" && type === "auth") {
            location.reload();
        }
    } catch (err) {
        const sp = document.querySelector(".btn-text-sp");
        sp.textContent = "save password";
        sp.nextElementSibling.style.display = "none";
        console.log(err.response);
    }
};
