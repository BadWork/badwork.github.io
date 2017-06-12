$('.btn-addPayment').on('click', function () {
	financeMngr.addPayment();
	financeMngr.showRecent();
	saveLocal();
})

$(".input-addPayment-sum").on("change", function (e) {
	var temp = +($(e.target).val());
	temp = temp.toFixed(2);
	$(e.target).val(temp);
})

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
	makeSubCategories("Досуг", "Сладкое");
	makeSubCategories("Досуг", "Перекус");
	console.log(financeMngr.categories);
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

var financeMngr = {
	balance: 0,
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
			payment.date = $('.date').datepicker('getDate');
			payment.date.setSeconds(payment.date.getSeconds() + this.payments.length);
			payment.sign = $('.btn-type').find('.active').find('input').val();
			payment.description = $(".input-description").val();
			this.payments.push(payment);
			this.payments.sort(function (a, b) {
				if (new Date(b.date).getTime() != new Date(a.date).getTime()) {
					return new Date(b.date).getTime() - new Date(a.date).getTime()
				}
			});
			this.countBalance();
			console.log(chartStracture.data);
	},
	isError: function () {
		
	},
	showRecent: function () {
		var recentAmount = 8;
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
			recent.find('.recent-date').last().text('('+this.payments[i].date.toString().slice(0,10)+')');
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

var chartStracture = {
	data: [],
	labels: [],
	colors: [],
	setData: function () {
		this.data = [];
		for (var i = 0; i < this.labels.length; i++) {
			var label = this.labels[i];
			this.data[i] = 0;
			for (var j = 0; j < financeMngr.payments.length; j++) {
				if (financeMngr.payments[j].category.name == this.labels[i] && financeMngr.payments[j].sign == '-') {
					this.data[i] += +financeMngr.payments[j].sum
				}
			}
		}
	},
	setLabel: function () {
		this.labels = [];
		for (var i = 0; i < financeMngr.payments.length; i++) {
			if (financeMngr.payments[i].sign == '-') {
				this.labels.push(financeMngr.payments[i].category.name)
			}
		}
		this.labels = jQuery.unique(this.labels);
	},
	setColor: function () {
		this.colors = [];
		for (var i = 0; i < financeMngr.payments.length; i++) {
			this.colors.push(randomColor())
		}
	},
	groupData: function () {

	},
	makeChart: function (period) {
		if (period == 'all') {
			this.setLabel();
			this.setData();
			this.setColor();
		}
	},
	init: function () {
		$('.chart-container').text("");
		$('.chart-container').append('<canvas id="chart"></canvas>');
		this.makeChart('all');
		var ctx = document.getElementById('chart').getContext('2d');
		var myPieChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				datasets: [{
					data: chartStracture.data,
					backgroundColor: chartStracture.colors,
					borderColor: chartStracture.colors,
				}],
				labels: chartStracture.labels
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
