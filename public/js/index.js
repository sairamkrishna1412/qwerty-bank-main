import "core-js/stable";
import "regenerator-runtime/runtime";

import { login, logout, signUp } from "./auth";
import { paybill, transferMoney, deleteUser } from "./utils";
import { updateUser } from "./profile";

const formLogin = document.querySelector(".form__login");
const formSignup = document.querySelector(".form__signup");
const formTransfer = document.querySelector(".transfer-form");
const formPaybill = document.querySelector(".paybill-form");
const formCloseAcc = document.querySelector(".close-form");
const logoutBtn = document.querySelector(".nav__logout");
const formUpdateDetails = document.querySelector(".form-update-details");
const formUpdatePassword = document.querySelector(".form-update-password");

if (formSignup) {
    formSignup.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const name = document.getElementById("name").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirm-password").value;

        signUp(email, name, password, confirmPassword);
    });
}

if (formLogin) {
    formLogin.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email, password);
    });
}

if (formTransfer) {
    formTransfer.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.querySelector(".transfer-form--username").value;
        const amount = parseInt(
            document.querySelector(".transfer-form--amount").value
        );
        const remarks = document.querySelector(
            ".transfer-form--description"
        ).value;
        transferMoney(email, amount, remarks);
    });
}

if (formPaybill) {
    const billSelect = document.getElementById("bill-type");
    billSelect.addEventListener("change", function (e) {
        e.preventDefault();
        document
            .querySelector(".paybill-form--electricity")
            .classList.toggle("hidden");
        document
            .querySelector(".paybill-form--mobile")
            .classList.toggle("hidden");
    });

    formPaybill.addEventListener("submit", function (e) {
        e.preventDefault();
        const type = billSelect.value;
        let number;
        if (type === "Electricity") {
            number = document.querySelector(".paybill-form--electricity").value;
        } else if (type === "Mobile recharge") {
            number = document.querySelector(".paybill-form--mobile").value;
        }
        const amount = parseInt(
            document.querySelector(".paybill-form--amount").value
        );
        const remarks = `${type} (${number}) : ${
            document.querySelector(".paybill-form--description").value
        }`;
        paybill(type, amount, remarks);
    });
}

if (formCloseAcc) {
    formCloseAcc.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.querySelector(".close-form--username").value;
        const password = document.querySelector(".close-form--password").value;
        deleteUser(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        logout();
    });
}

if (formUpdateDetails) {
    formUpdateDetails.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value;
        updateUser("details", { name });
    });
}

if (formUpdatePassword) {
    formUpdatePassword.addEventListener("submit", function (e) {
        e.preventDefault();

        const currentPassword = document.getElementById("cur_pass").value;
        const newPassword = document.getElementById("new_pass").value;
        const confirmNewPassword =
            document.getElementById("confirm_new_pass").value;

        updateUser("auth", {
            currentPassword,
            newPassword,
            confirmNewPassword,
        });
    });
}
