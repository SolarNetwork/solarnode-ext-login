/* eslint-env es6, browser, commonjs */

import "../scss/style.scss";

import { replaceData } from "./utils.js";
import $ from "jquery";
import AES from "crypto-js/aes";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import CryptJS from "crypto-js/core";

interface Credentials {
	readonly username: string;
	readonly password: string;
	readonly host: string;
}

function credentials(): Credentials {
	return {
		username: $("#credentials input[name=username]").val() as string,
		password: $("#credentials input[name=password]").val() as string,
		host: $("#credentials input[name=host]").val() as string,
	};
}

function handleCredentialsChange() {
	const creds = credentials();
	$("#login-btn").prop(
		"disabled",
		!(creds.username && creds.password && creds.host)
	);
}

function doLogin() {
	const creds = credentials();
	const salt = CryptJS.lib.WordArray.random(12);
	const keyUrl = `${creds.host}/pub/session/key?username=${encodeURIComponent(
		creds.username
	)}&salt=${encodeURIComponent(Base64.stringify(salt))}`;
	$.getJSON(keyUrl)
		.done((keyRes) => {
			if (
				keyRes.success !== true ||
				!keyRes.data ||
				!keyRes.data.key ||
				!keyRes.data.iv
			) {
				alert("Error: key/iv data not available.");
				return;
			}

			const key = Base64.parse(keyRes.data.key);
			const iv = Base64.parse(keyRes.data.iv);
			const encryptedPassword = AES.encrypt(creds.password, key, {
				iv: iv,
			});
			const saltyUsername = Base64.stringify(
				// not sure best way to concatenate two WordArray objects, so string join hex, decode
				Hex.parse(Hex.stringify(salt) + Utf8.parse(creds.username))
			);

			console.info(
				`Encrypted password using AES(${keyRes.data.key}): ${encryptedPassword}`
			);
			console.info(
				`Salty username: ${saltyUsername} (${Hex.stringify(
					salt
				)}:${Utf8.parse(creds.username)})`
			);

			const nodeUrl = `${
				creds.host
			}/pub/session/login?username=${encodeURIComponent(
				saltyUsername
			)}&password=${encodeURIComponent(encryptedPassword.toString())}`;
			$("#solarnode").attr("src", nodeUrl);
		})
		.fail((_xhr, status, err) => {
			alert("Failed to request crypt format: " + status + ": " + err);
		});
}

function startApp() {
	$("#credentials").on("submit", function () {
		doLogin();
		return false;
	});
	$("#credentials input").on("change keyup", handleCredentialsChange);
	// configure host to deployed hostname, unless file: or localhost
	if (
		window !== undefined &&
		window.location.protocol !== undefined &&
		window.location.protocol.toLowerCase().indexOf("http") === 0 &&
		window.location.host.toLowerCase().indexOf("localhost") !== 0
	) {
		$("#credentials input[name=host]").val("http://solarnode");
	}
}

if (
	document.readyState === "complete" ||
	document.readyState === "interactive"
) {
	// populate app version and then display it
	replaceData(document.querySelector<HTMLElement>("#app-version")!, {
		"app-version": APP_VERSION,
	}).classList.add("d-md-block");

	startApp();
} else {
	window.addEventListener("load", startApp);
}
