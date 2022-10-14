const getDate = (timestamp: number | Date) => {
	const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
	return `${date.getDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
}

const getTime = (timestamp: number | Date) => {
	const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
	return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
}

const getDuration = (timestamp: number) => {
	const hours = Math.floor(timestamp / (3600 * 1000));
	const minutes = Math.floor(timestamp / (60 * 1000)) % 60;
	const seconds = Math.floor(timestamp / 1000) % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export { getDate, getTime, getDuration }