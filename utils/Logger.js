const chalk = require("chalk")
const moment = require("moment")
const fs = require("fs")
let output = process.stdout

module.exports = {
	"info": function info(prefix, message) {
		if(message) {
			console.info(`[${getDayAndHour()} ${chalk.blue("INFO")}]: ${prefix} ${message}`)
		}
		else {
			console.info(`[${getDayAndHour()} ${chalk.blue("INFO")}]: ${prefix}`)
		}
	},
	"log": function log(prefix, message) {
		if(message) {
			console.info(`[${getDayAndHour()} ${chalk.blue("LOGS")}]: ${prefix} ${message}`)
		}
		else {
			console.info(`[${getDayAndHour()} ${chalk.blue("LOGS")}]: ${prefix}`)
		}
	},
	"warn": function warn(prefix, message) {
		if(message) {
			console.info(`[${getDayAndHour()} ${chalk.yellow("WARN")}]: ${prefix} ${chalk.yellow(message)}`)
		}
		else {
			console.info(`[${getDayAndHour()} ${chalk.yellow("WARN")}]: ${chalk.yellow(prefix)}`)
		}
	},
	"error": function error(prefix, message) {
		if(message) {
			console.info(`[${getDayAndHour()} ${chalk.red("ERR!")}]: ${prefix} ${chalk.red(message)}`)
		}
		else {
			console.info(`[${getDayAndHour()} ${chalk.red("ERR!")}]: ${chalk.red(prefix)}`)
		}
	},
	"ok": function ok(prefix, message) {
		if(message) {
			console.info(`[${getDayAndHour()} ${chalk.green(" OK ")}]: ${prefix} ${chalk.green(message)}`)
		}
		else {
			console.info(`[${getDayAndHour()} ${chalk.green(" OK ")}]: ${chalk.green(prefix)}`)
		}
	},
	"wait": function wait(prefix, message) {
		if(message) {
			output.write(`[${getDayAndHour()} ${chalk.blue(" .. ")}]: ${prefix} ${message}`)
			output.cursorTo(0)
		}
		else {
			output.write(`[${getDayAndHour()} ${chalk.blue(" .. ")}]: ${prefix}`)
			output.cursorTo(0)
		}
	},
	"fatal": function fatal(err) {
		console.info(`${chalk.bgRed(`[${getDayAndHour()} FATAL]: Encountered an uncaught exception`)}\n${err.stack}`)
		let crashReport = `An unexpected exception occurred
		
Time: ${getDayAndHour()}
Error: ${err}
		
Stack trace:

${err.stack}
		`
		let heure = `${moment().format("DD-MM-YYYY")} ${moment().format("HH-mm-ss-SSS")}`
		if(fs.existsSync("./crashs-report")) {
			fs.writeFile(`./crashs-report/${heure}.txt`, crashReport, function(err) {
				if(err) module.exports.error("Unable to save crash report:\n" + err.stack)
				if(!err) module.exports.error("This crash report has been saved to: ./crashs-report/" + heure + ".txt")
				process.exit(1)
			})
		}
		else {
			fs.mkdir("./crashs-report", function(err1) {
				fs.writeFile(`./crashs-report/${heure}.txt`, crashReport, function(err) {
					if(err) module.exports.error("Unable to save crash report:\n" + err.stack)
					if(!err) module.exports.error("This crash report has been saved to: ./crashs-report/" + heure + ".txt")
					process.exit(1)
				})
			})
		}
	},
}

function getDayAndHour() {
	let day = moment().format("DD/MM/YYYY")
	let hour = moment().format("HH:mm:ss.SSS")
	return `${day} ${hour}`
}