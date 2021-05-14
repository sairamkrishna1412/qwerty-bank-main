import axios from "axios";

export const login = async function (email, password) {
    try {
        document.querySelector(".spinner-hidden").style.display =
            "inline-block";
        const response = await axios({
            method: "post",
            url: "/users/login",
            data: {
                email,
                password,
            },
        });
        if (response.data.status === "success") {
            // console.log(response);
            window.location.assign("/account");
        }
    } catch (err) {
        document.querySelector(".spinner-hidden").style.display = "none";
        console.error(err.response);
    }
};

export const logout = async function () {
    try {
        const response = await axios({
            method: "get",
            url: "/users/logout",
        });
        if (response.data.status === "success") {
            // console.log(response);
            location.assign("/");
        }
    } catch (err) {
        console.error(err);
    }
};

export const signUp = async function (email, name, password, confirmPassword) {
    try {
        document.querySelector(".spinner-hidden").style.display =
            "inline-block";
        const response = await axios({
            method: "post",
            url: "/users/signup",
            data: {
                email,
                name,
                password,
                confirmPassword,
            },
        });
        if (response.data.status === "success") {
            document.querySelector(".section-authenticate").style.display =
                "none";
            document.querySelector(".verify-div").classList.remove("hidden");
            document.querySelector(".email-text").innerHTML =
                response.data.data.message;
            console.log(response);
        }
    } catch (err) {
        document.querySelector(".spinner-hidden").style.display = "none";
        console.log(err.response);
    }
};
