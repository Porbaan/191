	// ป้องกันการคลิกขวาทั้งหน้าเว็บ
	document.addEventListener("contextmenu", function(event) {
    event.preventDefault(); // ป้องกันการเปิดเมนูคลิกขวา
	});

	let remainingDays = ""; // ตัวแปรใหม่สำหรับแสดงวันคงเหลือ
	let sheetData = [];
	let sheetData2 = [];
	async function loadSheetData() {
		const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMfyBv2p_3HC_Czn3ZYWIFfJ6PwmNL2Nr88PBbk9xKiVS1ZnU5GZ9Z-CclLG4WUGRJlhMkBVSPmAck/pub?output=csv";
		const response = await fetch(url);
		const csvText = await response.text();
		sheetData = csvToObjects(csvText);
		console.log("ข้อมูล Google Sheets:", sheetData);
	}
	// ฟังก์ชันโหลดข้อมูลจาก Google Sheets
	async function loadSheetData2() {
		const url2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQrKz3zhXOEKTxeCejdrNo4T9Kq_Oyr5k2WYxPqTVYZwUc2hFybqk9frTuwL_Cim0OijGSm57Gj-DlL/pub?output=csv"; // URL ของ Google Sheets
		const response = await fetch(url2);
		const csvText = await response.text();
		sheetData2 = csvToObjects(csvText); // แปลง CSV เป็นออบเจ็กต์
		console.log("ข้อมูล Google Sheets:", sheetData2); // ตรวจสอบข้อมูลที่โหลด
	}
	// แปลง CSV เป็นออบเจ็กต์
	function csvToObjects(csv) {
		const lines = csv.trim().split('\n');
		const headers = lines[0].split(',');
		return lines.slice(1).map(line => {
			const values = line.split(',');
			const obj = {};
			headers.forEach((header, i) => {
				obj[header.trim()] = values[i].trim();
			});
			return obj;
		});
	}
	// ฟังก์ชันตรวจสอบคีย์
	function checkKey() {
		const inputKey = document.getElementById("key-input").value.trim();
		// หาแถวข้อมูลที่ตรงกับคีย์ในคอลัมน์ A
		const found = sheetData2.find(row => row['A'].trim() === inputKey);
		if(found) {
			const level = found['D'].trim(); // ดึงระดับสิทธิ์จากคอลัมน์ D
			const remaining = found['C']; // ดึงวันคงเหลือจากคอลัมน์ C
			// แสดงข้อมูลวันคงเหลือในบอลลูน
			document.getElementById("remaining-days-balloon").textContent = "วันคงเหลือ: " + remaining;
			document.getElementById("balloon-container").style.display = "block";
			document.getElementById("key-container").style.display = "none";
			if(level === '000') {
				// สิทธิ์ระดับ 000 ให้แสดงเนื้อหาที่ซ่อนด้วย
				const sections = document.querySelectorAll('.section');
				sections.forEach(section => {
					const h3 = section.querySelector('h3');
					if(h3 && h3.textContent.trim() === "อัพเดทข้อมูล") {
						section.style.display = "block"; // เปิดเนื้อหาที่ซ่อน
						section.removeAttribute('data-hidden');
					}
				});
			} else if(level === '111') {
				// สิทธิ์ระดับ 111 ให้ซ่อนเนื้อหาที่ซ่อน
				const sections = document.querySelectorAll('.section');
				sections.forEach(section => {
					const h3 = section.querySelector('h3');
					if(h3 && h3.textContent.trim() === "อัพเดทข้อมูล") {
						section.style.display = "none"; // ซ่อนเนื้อหา
						section.setAttribute('data-hidden', "true");
					}
				});
			}
		} else {
			alert("คีย์ไม่ถูกต้อง");
			document.getElementById("balloon-container").style.display = "none";
			document.getElementById("key-container").style.display = "block";
		}
	}
	// โหลดข้อมูลตอนเริ่มหน้า
	loadSheetData();
	loadSheetData2();
	const toggleBtn = document.getElementById('toggle-key-container');
	const keyContainer = document.getElementById('key-container');
	toggleBtn.addEventListener('click', () => {
		if(keyContainer.style.display === 'none' || keyContainer.style.display === '') {
			// แสดงช่องกรอก
			keyContainer.style.display = 'block';
			toggleBtn.textContent = 'ซ่อน';
		} else {
			// ซ่อนช่องกรอก
			keyContainer.style.display = 'none';
			toggleBtn.textContent = 'แสดง';
		}
	});
	// ฟังก์ชันตรวจสอบคีย์และเติมข้อมูล
	let debounceTimer;
	document.getElementById("image-url").addEventListener("input", function() {
		clearTimeout(debounceTimer);
		const inputField = this;
		debounceTimer = setTimeout(() => {
			const val = inputField.value.trim();
			const lotteryNameInput = document.getElementById("lottery-name");
			const found = sheetData.find(row => row.key === val);
			if(found) {
				inputField.value = found.imageUrl;
				lotteryNameInput.value = found.lotteryName;
			}
		}, 2000); // 2000 ms = 2 วินาที
	});
	// ฟังก์ชันปิดเนื้อหาอัพเดทข้อมูล
	function closeUpdateSection() {
		// หา div ที่มี class section และ h3 เป็น "อัพเดทข้อมูล"
		const sections = document.querySelectorAll('.section');
		sections.forEach(section => {
			const h3 = section.querySelector('h3');
			if(h3 && h3.textContent.trim() === "อัพเดทข้อมูล") {
				section.style.display = "none"; // ซ่อน div
				section.setAttribute("data-hidden", "true"); // ตั้ง attribute ซ่อนไว้ด้วย
			}
		});
	}
	let useLotteryName = false; // สถานะเริ่มต้น ปิดแสดงชื่อบนรูป
	function toggleLotteryName() {
		useLotteryName = !useLotteryName;
		const btn = document.getElementById("toggle-lottery-name");
		btn.textContent = useLotteryName ? "เปิดแสดงชื่อแล้ว" : "ปิดแสดงชื่อแล้ว";
	}

	function getCurrentDate() {
		let date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear() + 543;
		return("0" + day).slice(-2) + "/" + ("0" + month).slice(-2) + "/" + year;
	}
	document.getElementById("current-date").value = getCurrentDate();

	function getRandomNumber(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function generateRud() {
		let A1, A2;
		do {
			A1 = getRandomNumber(0, 9);
			A2 = getRandomNumber(0, 9);
		} while (A1 === A2);
		return `${A1} - ${A2}`;
	}

	function generateRong(A1, A2) {
		let B1, B2, B3;
		do {
			B11 = getRandomNumber(0, 9);
		} while (B11 === A1 || B11 === A2);
		do {
			B12 = getRandomNumber(0, 9);
		} while (B12 === A1 || B12 === A2 || B12 === B11);
		do {
			B13 = getRandomNumber(0, 9);
		} while (B13 === A1 || B13 === A2 || B13 === B11 || B13 === B12);
		return `${B11} - ${B12} - ${B13}`;
	}

	function generateMoney(A1, A2, B1, B2, B3) {
		let C1 = `${A1}${A2}`;
		let C2 = `${A1}${B11}`;
		let C3 = `${A1}${B12}`;
		let C4 = `${A1}${B13}`;
		return `${C1} ${C2} ${C3} ${C4}`;
	}

	function generateGold(A2, B1, B2, B3) {
		let D1 = `${A2}${A2}`;
		let D2 = `${A2}${B11}`;
		let D3 = `${A2}${B12}`;
		let D4 = `${A2}${B13}`;
		return `${D1} ${D2} ${D3} ${D4}`;
	}

	function generateDent(B1, B2, B3) {
		let E1 = `${B11}${B12}`;
		let E2 = `${B11}${B13}`;
		let E3 = `${B12}${B13}`;
		let E4 = ("00" + getRandomNumber(0, 99)).slice(-2);
		return `${E1} ${E2} ${E3} ${E4}`;
	}

	function reverse(number) {
		return number.split('').reverse().join('');
	}

	function generateNumbers() {
		let rud = generateRud();
		let rudSplit = rud.split(' - ');
		let A1 = parseInt(rudSplit[0]);
		let A2 = parseInt(rudSplit[1]);
		let rong = generateRong(A1, A2);
		let rongSplit = rong.split(' - ');
		let B1 = parseInt(rongSplit[0]);
		let B2 = parseInt(rongSplit[1]);
		let B3 = parseInt(rongSplit[2]);
		let money = generateMoney(A1, A2, 5, 6, 7);
		let gold = generateGold(A2, 1, 2, 3);
		let dent = generateDent(1, 2, 3);
		document.getElementById("result-rud").value = rud;
		document.getElementById("result-rong").value = rong;
		document.getElementById("result-money").value = money;
		document.getElementById("result-gold").value = gold;
		document.getElementById("result-dent").value = dent;
		let imageUrl = document.getElementById("image-url").value;
		let lotteryNameInput = document.getElementById("lottery-name");
		let lotteryName = lotteryNameInput.value;
		if(imageUrl) {
			displayImageWithResult(rud, rong, money, gold, dent, imageUrl, lotteryName);
		} else {
			alert("กรุณากรอก URL รูปภาพ");
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////////////////
	function displayImageWithResult(rud, rong, money, gold, dent, imageUrl, lotteryName) {
		let canvas = document.getElementById("canvas");
		let ctx = canvas.getContext("2d");
		let img = new Image();
		img.onload = function() {
			canvas.width = img.width;
			canvas.height = img.height;
			let gradient = ctx.createLinearGradient(400, 80, 600, 80);
			gradient.addColorStop(0, "#FF0000"); // แดง
			gradient.addColorStop(1, "#FFFF00"); // เหลือง
			ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;
			ctx.shadowBlur = 4;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			ctx.font = "bold 30px Arial";
			ctx.fillStyle = "white";
			ctx.fillText(getCurrentDate(), 401, 216);
			ctx.font = "bold 60px Arial";
			ctx.fillStyle = "white";
			ctx.fillText(rud, 422, 180);
			ctx.fillStyle = "#ebbb4a";
			ctx.font = "bold 35px Arial";
			ctx.fillText(money, 360, 325);
			ctx.fillStyle = "#ebbb4a";
			ctx.font = "bold 35px Arial";
			ctx.fillText(gold, 360, 390);
			ctx.fillStyle = "white";
			ctx.font = "bold 40px Arial";
			ctx.fillText(dent, 300, 451);
			if(useLotteryName && lotteryName) { // วาดชื่อเฉพาะถ้าเปิดสถานะ
				ctx.fillStyle = "yellow";
				ctx.font = "bold 40px Arial";
				ctx.fillText(lotteryName, 50, 50);
			}
			canvas.style.display = 'block';
		};
		img.src = imageUrl;
	}

	function clearImageUrl() {
		document.getElementById("image-url").value = ""; // ล้างค่าในช่อง URL รูปภาพ
	}

	function copyToClipboard(id, button) {
		var copyText = document.getElementById(id);
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		document.execCommand("copy");
		button.textContent = "คัดลอกแล้ว";
		setTimeout(function() {
			button.textContent = "คัดลอก";
		}, 1500);
	}