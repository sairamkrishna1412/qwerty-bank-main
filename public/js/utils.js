import axios from "axios";

export const transferMoney = async function (email, amount, remarks) {
    try {
        loader("add", "transfer");
        // document.querySelector(".transfer-arrow").textContent = "";
        // document.querySelector(".spinner-hidden").style.display = "inline-block";
        const response = await makeTransaction(email, amount, remarks);
        if (response.data.status === "success") {
            location.reload();
        }
    } catch (err) {
        loader("remove", "transfer");
        // document.querySelector(".spinner-hidden").style.display = "none";
        // document.querySelector(".transfer-arrow").textContent = "→";
        console.log(err.response);
    }
};

export const paybill = async function (type, amount, remarks) {
    try {
        loader("add", "paybill");
        const email =
            type === "Electricity"
                ? "electricity@qwerty.com"
                : "recharge@qwerty.com";
        const response = await makeTransaction(email, amount, remarks);
        if (response.data.status === "success") {
            location.reload();
        }
    } catch (err) {
        loader("remove", "paybill");
        console.log(err.response);
    }
};

export const deleteUser = async function (email, password) {
    try {
        loader("add", "closeAcc");
        const response = await axios({
            method: "post",
            url: "/users/closeAcc",
            data: {
                email,
                password,
            },
        });
        if (response.data.status === "success") {
            location.assign("/");
        }
    } catch (err) {
        loader("remove", "closeAcc");
        console.log(err.response);
    }
};

const loader = function (type, util) {
    let spin, arrow;
    if (type === "add") {
        spin = "inline-block";
        arrow = "";
    } else {
        spin = "none";
        arrow = "→";
    }
    const arrowElement = document.querySelector(`.${util}-arrow`);
    const spinElement = arrowElement.nextElementSibling;

    //next line if there are siblings other than .fa-spin
    // const spinElement = arrowElement.parentElement.querySelector(".spinner-hidden");
    arrowElement.textContent = arrow;
    spinElement.style.display = spin;
};

const makeTransaction = async function (email, amount, remarks) {
    const response = await axios({
        method: "post",
        url: "/transaction/new",
        data: {
            email,
            amount,
            remarks,
        },
    });
    return response;
};
