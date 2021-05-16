import axios from "axios";
import { alert } from "./alert";

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
            alert("success", "Logging in!");
            window.location.assign("/account");
        }
    } catch (err) {
        document.querySelector(".spinner-hidden").style.display = "none";
        alert("error", err.response.data.message);
        // console.error(err.response);
    }
};

export const logout = async function () {
    try {
        const response = await axios({
            method: "get",
            url: "/users/logout",
        });
        if (response.data.status === "success") {
            alert("success", "Logging out.");
            // console.log(response);
            location.assign("/");
        }
    } catch (err) {
        alert("error", "Something went wrong, Try again.");
        // console.log(error.response);
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
            alert("success", "Please check your Email.", 30);
            // console.log(response);
        }
    } catch (err) {
        document.querySelector(".spinner-hidden").style.display = "none";
        alert("error", err.response.data.message);
        // console.log(err.response);
    }
};
