import Head from "next/head";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function App() {
	// States Management
	const [expression, setExpression] = useState([]);
	const [input, setInput] = useState("0");
	const [result, setResult] = useState(null);
	const [formula, setFormula] = useState(true);

	// Locals
	const keys = [
		{
			value: 0,
			text: "zero",
			key: "0",
		},
		{
			value: 1,
			text: "one",
			key: "1",
		},
		{
			value: 2,
			text: "two",
			key: "2",
		},
		{
			value: 3,
			text: "three",
			key: "3",
		},
		{
			value: 4,
			text: "four",
			key: "4",
		},
		{
			value: 5,
			text: "five",
			key: "5",
		},
		{
			value: 6,
			text: "six",
			key: "6",
		},
		{
			value: 7,
			text: "seven",
			key: "7",
		},
		{
			value: 8,
			text: "eight",
			key: "8",
		},
		{
			value: 9,
			text: "nine",
			key: "9",
		},
		{
			value: ".",
			text: "decimal",
			key: ".",
		},
		{
			value: "+",
			text: "add",
			key: "+",
		},
		{
			value: "-",
			text: "subtract",
			key: "-",
		},
		{
			value: "*",
			text: "multiply",
			key: "*",
		},
		{
			value: "/",
			text: "divide",
			key: "/",
		},
		{
			value: "=",
			text: "equals",
			key: "Enter"
		},
		{
			value: "AC",
			text: "clear",
			key: "Delete"
		},
		{
			value: "<<",
			text: "back",
			key: "Backspace",
		},
	];

	const clickedStyle = event => {
		handleMouseDown(event);
		setTimeout(handleMouseUp(event), 100);
	};

	const handleMouseDown = event => {
		event.target.style.opacity = "0.5";
	};

	const handleMouseUp = event => {
		event.target.style.opacity = "1";
	};

	const handleClick = event => {cd 
		clickedStyle(event);
		const text = event.target.innerText;

		// All Clear
		if (/AC/.test(text)) {
			setInput("0");
			setExpression([]);
			setResult(null);
		}

		// Back button. Slice the last digit off when pressed. When at length 1, return input to "0".
		if (/<</.test(text)) {
			if (input.length > 1) setInput(pv => pv.slice(0, pv.length - 1));
			else setInput("0");
		}

		// Inputs
		if (/[\d\.]/.test(text)) {
			if (expression.at(-1) === "=") { // Reset expression for new operation.
				setExpression([]);
				setResult(null);
			}
			if ("0".includes(input)) setInput(""); // Remove leading 0 and operation symbols beside negative.
			if (expression.join("").length + input.length > 100) return; // Limit equation length to 100 chars.
			if (input.length >= 12 && !/\.$/.test(input)) return; // Allow up to 12 digits. If last index is a decimal point, then allow another digit.
			if (/\./.test(text) && input.includes(".")) return; // Limit to one decmial point.
			setInput(pv => {
				if (/\./.test(text) && pv === "") pv = "0";
				return pv + text;
			})
		}

		// Operations
		if (/[\+\-\*\=/]/.test(text)) {
			// Handle input null and "-"
			if (input === "" || input === "-") {
				if (expression.at(-1) === "=") { // Continue operation after calculation.
					if (text !== "=") {
						setResult(null);
						setExpression([result.toString(), text]);
					}
					else {
						if (formula) setExpression([result.toString(), text]);
						else if (expression.length > 2) {
							setResult(Math.round(singleStepCalculation(result, Number(expression[2]), expression[1]) * 10000) / 10000);
							setExpression((pv) => [result.toString()].concat(pv.slice(1)));
						}
					}
				}
				if (/\-/.test(text) && input !== "-" && expression.at(-1) !== "=") setInput("-");
				else {
					setExpression(pv => pv.slice(0, pv.length - 1).concat(text));
					setInput("");
				}
				if (formula && /[=]/.test(text) && "+-*/".includes(expression.at(-1))) { // Handle calculation in case user click = after operation pad, therefore, no input.
					setResult(formulaCalculation(expression.slice(0, expression.length - 1).join("")));
				}
			} else { // Handle input operations
				setInput(""); //Always clear input
				// Logic switch
				if (formula) { // Formula logic
					setExpression(pv => pv.concat(input, text));
					if (/=/.test(text)) {
						setResult(formulaCalculation(expression.join("").concat(input)));
					}
				} else { // Single-step logic
					if (expression.length < 1) {
						setResult(Number(input));
						setExpression([input, text]);
					} else {
						const total = Math.round(singleStepCalculation(Number(expression[0]), Number(input), expression[1]) * 10000) / 10000;
						setResult(total);
						if (/=/.test(text)) {
							setExpression(pv => pv.concat(input, text));
						} else {
							setExpression([total.toString(), text]);
						}
					}
				}
			}
		}
	};

	const formulaCalculation = str => {
		return Math.round(eval(str.replace(/--/, "+")) * 10000) / 10000;
	}

	const singleStepCalculation = (a, b, operator) => {
		switch (operator) {
			case "+": return a + b;
			case "-": return a - b;
			case "*": return a * b;
			case "/": return a / b;
			default: console.error("Invalid operation.");
		}
	}

	const changeLogic = event => {
		setFormula(pv => !pv);
	};

	const formatAccounting = str => {
		if (str === "") return;
		if (str === "-") return "-";
		if (str.match(/(?<!\.)\d+/)[0].length <= 3) return str;
		return formatAccounting(str.replace(/(?<=\-?\d+)(?=\d{3}[\.,])|(?<=\-?\d+)(?=\d{3}\b)/, ","));
	}

	const handleKeyDown = event => {
		for (let cv of keys) {
			if (event.key === cv.key) {
				const element = document.getElementById(cv.text);
				element.click();
				element.style.opacity = "0.5";
				setTimeout(() => {
					element.style.opacity = "1"
				}, 100);
			}
		}
	};

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		}
	});

	return (
		<article id="wrapper">
			<Head>
				<title>Calculator</title>
			</Head>
			<main id="calculator">
				<h1 id="title">Calculator</h1>
				<section id="logic" onClick={changeLogic}>{formula ? "Formula Logic" : "Single-Step Logic"}</section>
				<section id="expression">{expression.join(" ")}</section>
				<section id="display">{input !== "" ? formatAccounting(input) :
					result === null ? null : formatAccounting(result.toPrecision(10).replace(/\.0+$|0+$/, ""))}</section>
				{keys.map((cv, idx) => <div key={idx} id={cv.text} className="pads" onClick={handleClick} onTouchStart={handleClick} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>{cv.value}</div>)}
			</main>
			<footer>
				<p className="copyright">© {new Date().getFullYear()} Firo Kong</p>
			</footer>
		</article>
	)
}