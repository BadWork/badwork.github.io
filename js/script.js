document.addEventListener('touchmove', function (event) {
	event = event.originalEvent || event;
	if (event.scale > 1) {
		event.preventDefault();
	}
}, false);

$('.btn-addPayment').on('click', function () {
	financeMngr.addPayment();
	financeMngr.showRecent();
	saveLocal();
})

$('.clear_all').on('click', function(){
	localStorage.clear();
	financeMngr.payments = [];
	financeMngr.showRecent();
})

$(".input-addPayment-sum").on("change", function (e) {
	var temp = +($(e.target).val());
	temp = temp.toFixed(2);
	$(e.target).val(temp);
})

$(".input-other-date").on("change", function (e) {
	$(".other.date").children(".other-date").text($('.date').datepicker('getDate', Date()).ddmmyyyy());
})

/*Конструкторы*/

function Payment() {
	this.sum = 0;
	this.category = {};
	this.date = new Date();
	this.sign = "+";
	this.description = "";
	this.currency = "BYN";
}

function Category(name) {
	this.name = name;
	this.subCategories = [];
	this.color = "";
}

function DataChart() {
	this.sum = 0;
	this.label = "";
	this.color = "";
}

Date.prototype.ddmmyyyy = function(){
	var tempDate = "";
	tempDate += this.getDate()+".";
	if (this.getMonth()<9){
		tempDate += "0"+(this.getMonth()+1)+".";
	}
	else{
		tempDate += (this.getMonth()+1)+".";
	}
	tempDate += this.getFullYear();
	return tempDate;
}

/*Конструкторы*/

/*Функции*/

function saveLocal() {
	var tempObj = JSON.stringify(financeMngr.payments); //сериализуем его
	localStorage.setItem("backup", tempObj); //запишем его в хранилище по ключу "myKey"
}

function loadLocal() {
	if (JSON.parse(localStorage.getItem("backup"))) {
		financeMngr.payments = JSON.parse(localStorage.getItem("backup"));
	}
	financeMngr.showRecent();
}

function makeCategories() {
	financeMngr.categories.push(new Category("Еда"));
	financeMngr.categories.push(new Category('Досуг'));
	financeMngr.categories.push(new Category('Квартира'));
	financeMngr.categories.push(new Category('Транспорт'));
	makeSubCategories("Еда", "Домой");
	makeSubCategories("Еда", "Сладкое");
	makeSubCategories("Еда", "Перекус");
	makeSubCategories("Досуг", "Кино");
	makeSubCategories("Досуг", "Театр");
	makeSubCategories("Досуг", "Аттракционы");
}

function makeSubCategories(category, subcategory) {
	var result = financeMngr.findCategory(category);
	result.subCategories.push(new Category(subcategory));
}

function showCategories() {
	var categories = $('.input-addPayment-category');
	categories.text("");
	for (var i = 0; i < financeMngr.categories.length; i++) {
		if (financeMngr.categories[i].subCategories.length > 0) {
			categories.append("<optgroup>");
			categories.find("optgroup").last().attr("label", financeMngr.categories[i].name);
			for (var j = 0; j < financeMngr.categories[i].subCategories.length; j++) {
				categories.find("optgroup").last().append("<option>");
				categories.find("optgroup").last().find("option").last().text(financeMngr.categories[i].subCategories[j].name);
			}
		} else {
			categories.append("<option>");
			categories.find("option").last().text(financeMngr.categories[i].name);
		}
	}
}

/*Функции*/


var financeMngr = { //Ядро всего финансового менеджера
	balance: 0,
	idCounter: 0,
	payments: [],
	categories: [],
	dates: [],
	countBalance: function () {
		var count = 0;
		for (var i = 0; i < this.payments.length; i++) {
			if (this.payments[i].sign == "+") {
				count += +this.payments[i].sum;
			} else {
				count -= +this.payments[i].sum;
			}
		}
		this.balance = count.toFixed(2);
	},
	addPayment: function () {
		var payment = new Payment();
		payment.sum = +($(".input-addPayment-sum").val());
		payment.sum = payment.sum.toFixed(2);
		payment.category = this.findCategory($(".selectpicker.input-addPayment-category").val());
		if ($('.input-dates .today').hasClass('active')) {
			payment.date = new Date();
			payment.date.setHours(0,0,0);
		} else if ($('.input-dates .yesterday').hasClass('active')) {
			payment.date = new Date();
			payment.date.setDate(payment.date.getDate() - 1);
			payment.date.setHours(0,0,0);
		}
		else{
			payment.date = $('.date').datepicker('getDate', Date());
		}
		payment.date.setSeconds(payment.date.getSeconds() + this.idCounter);
		this.idCounter += 1;
		payment.sign = $('.sign-block').find('.active').find('input').val();
		payment.description = $(".input-description").val();
		this.payments.push(payment);
		this.payments.sort(function (a, b) {
			if (new Date(b.date).getTime() != new Date(a.date).getTime()) {
				return new Date(b.date).getTime() - new Date(a.date).getTime()
			}
		});
		this.countBalance();
		console.log(payment);
	},
	showRecent: function () {
		var recentAmount = 6;
		var recent = $('.lastPayments-list');
		$('.lastPayments-list').text('');
		if (this.payments.length < recentAmount) {
			recentAmount = this.payments.length;
		}
		for (var i = 0; i < recentAmount; i++) {
			recent.append('<li><span class="sign"></span><span class="sum"></span><span class="currency"></span><span class="recent-date"></span><span class="category pull-right"></span><span class="glyphicon glyphicon-tag pull-right" aria-hidden="true"></span></li>');
			recent.find('.sign').last().text(this.payments[i].sign);
			recent.find('.sum').last().text(this.payments[i].sum);
			recent.find('.currency').last().text(this.payments[i].currency);
			console.log(this.payments[i]);
			recent.find('.recent-date').last().text(this.payments[i].date.ddmmyyyy());
			recent.find('.category').last().text(this.payments[i].category.name);
		}
		this.countBalance();
		$('.balance').text(this.balance + ' BYN');
		chartStracture.init();
	},
	findCategory: function (value) {
		for (var i = 0; i < this.categories.length; i++) {
			if (this.categories[i]["name"] == value) {
				return this.categories[i];
			} else {
				for (var j = 0; j < this.categories[i].subCategories.length; j++) {
					if (this.categories[i].subCategories[j]["name"] == value) {
						return this.categories[i].subCategories[j];
					}
				}
			}
		}
		return null;
	}
}

var chartStracture = { //Всё, что касается графиков
	data: [],
	getData: function (number) {
		var dataArray = [];
		if (number > this.data.length) {
			for (var i = 0; i < this.data.length; i++) {
				dataArray.push(this.data[i].sum);
			}
		} else {
			for (var i = 0; i < number; i++) {
				dataArray.push(this.data[i].sum);
			}
		}
		return dataArray;
	},
	getColors: function () {
		var colorsArray = [];
		for (var i = 0; i < this.data.length; i++) {
			colorsArray.push(this.data[i].color);
		}
		return colorsArray;
	},
	getLabels: function (number) {
		var labelsArray = [];
		if (number > this.data.length) {
			for (var i = 0; i < this.data.length; i++) {
				labelsArray.push(this.data[i].label);
			}
		} else {
			for (var i = 0; i < number; i++) {
				labelsArray.push(this.data[i].label);
			}
		}
		return labelsArray;
	},
	setData: function () {
		var tempData = [];
		this.data = [];
		for (var i = 0; i < financeMngr.payments.length; i++) {
			var dataObject = new DataChart();
			if (financeMngr.payments[i].sign == '-') {
				dataObject.sum = +financeMngr.payments[i].sum;
				dataObject.sum.toFixed(2);
				dataObject.label = financeMngr.payments[i].category.name;
				dataObject.color = randomColor();
				tempData.push(dataObject);
			}
		}
		tempData.sort(function (a, b) {
			var aLabel = a.label;
			var bLabel = b.label;
			return ((aLabel < bLabel) ? -1 : ((aLabel > bLabel) ? 1 : 0));
		});
		for (var i = 0; i < tempData.length; i++) {
			for (var j = i + 1; j < tempData.length; j++) {
				if (tempData[i].label == tempData[j].label) {
					tempData[i].sum += +tempData[j].sum;
					tempData[j].label = "";
					tempData[j].sum = 0;
				}
			}
			if (tempData[i].label != "") {
				this.data.push(tempData[i]);
			}
		}
	},
	sortData: function () {
		this.data.sort(function (a, b) {
			var aSum = a.sum;
			var bSum = b.sum;
			return ((aSum > bSum) ? -1 : ((aSum < bSum) ? 1 : 0));
		});
	},
	makeChart: function (period) {
		if (period == 'all') {
			this.setData();
			this.sortData();
		}
	},
	init: function () {
		$('.chart-container-1').text("");
		$('.chart-container-1').append('<canvas id="chart"></canvas>');
		$('.chart-container-2').text("");
		$('.chart-container-2').append('<canvas id="chart2"></canvas>');
		this.makeChart('all');
		var ctx = document.getElementById('chart').getContext('2d');
		var cty = document.getElementById('chart2').getContext('2d');
		var myPieChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				datasets: [{
					data: chartStracture.getData(5),
					backgroundColor: chartStracture.getColors(),
					borderColor: chartStracture.getColors(),
				}],
				labels: chartStracture.getLabels(5)
			},
			options: {
				maintainAspectRatio: false,
				responsive: true,
				legend: {
					display: true,
					position: 'bottom'
				}
			}
		})
		var myHorizontalChart = new Chart(cty, {
			type: 'horizontalBar',
			data: {
				datasets: [{
					data: chartStracture.getData(7),
					backgroundColor: chartStracture.getColors(),
					borderColor: chartStracture.getColors(),
				}],
				labels: chartStracture.getLabels(7)
			},
			options: {
				maintainAspectRatio: false,
				responsive: true,
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						gridLines: {
							display: false,
							drawBorder: false,
						},
						ticks: {
							beginAtZero:true,
							display: false
						}
					}],
					yAxes: [{
						maxBarThickness: 30,
						barThickness: 20,
						ticks: {
							beginAtZero:true
						},
						gridLines: {
							display: false,
							drawBorder: false
						}
					}]
				}				
			}
		})
	}
}

makeCategories();
showCategories();
$('.date').datepicker({
	language: "ru",
	maxViewMode: 2,
	todayHighlight: true,
	autoclose: true
});
$('.date').datepicker('setDate', Date());
loadLocal();
