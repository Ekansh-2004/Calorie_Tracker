class CalorieTracker {
	constructor() {
		this._dailyLimit = Storage.getCalorieLimit();
		this._totalCalories = Storage.getCalorieTotal();
		this._meals = Storage.getMeals();
		this._workouts = Storage.getWorkouts();

		this._displayCaloriesConsumed();
		this._displayCaloriesBurned();
		this._displayCaloriesGain();
		this._displayDailyLimitCalorie();
		this._displayCaloriesRemaining();
		this._displayProgressBar();

		document.getElementById("limit").value = this._dailyLimit;
	}

	setDailyCalorieLimit(limit) {
		this._dailyLimit = limit;
		Storage.setCalorieLimit(limit);
		this._displayDailyLimitCalorie();
		this._render();
	}

	addMeal(meal) {
		this._meals.push(meal);
		this._totalCalories += meal.calories;
		this._displayNewMeal(meal);
		Storage.updateCalorieTotal(this._totalCalories);
		Storage.saveMeals(meal);
		this._render();
	}

	addWorkout(workout) {
		this._workouts.push(workout);
		this._totalCalories -= workout.calories;
		this._displayNewWorkout(workout);
		Storage.updateCalorieTotal(this._totalCalories);
		Storage.saveWorkouts(workout);
		this._render();
	}

	removeMeal(id) {
		const index = this._meals.findIndex((meal) => meal.id === id);

		if (index !== -1) {
			const meal = this._meals[index];
			this._totalCalories -= meal.calories;
			Storage.updateCalorieTotal(this._totalCalories);
			this._meals.splice(index, 1);
			Storage.removeMeal(id);
			this._render();
		}
	}

	removeWorkout(id) {
		const index = this._workouts.findIndex((workout) => workout.id === id);

		if (index !== -1) {
			const workout = this._workouts[index];
			this._totalCalories += workout.calories;
			Storage.updateCalorieTotal(this._totalCalories);
			this._workouts.splice(index, 1);
			Storage.removeWorkout(id);
			this._render();
		}
	}

	reset() {
		this._dailyLimit = 2000;
		this._totalCalories = 0;
		this._meals = [];
		this._workouts = [];
		Storage.clearAll();

		this._render();
	}

	loadItems() {
		this._meals.forEach((meal) => this._displayNewMeal(meal));
		this._workouts.forEach((workout) => this._displayNewWorkout(workout));
	}

	_displayDailyLimitCalorie() {
		document.getElementById("calories-limit").innerText = this._dailyLimit;
	}

	_displayCaloriesConsumed() {
		let sum = 0;

		this._meals.forEach((meal) => {
			sum += meal.calories;
		});

		document.getElementById("calories-consumed").innerText = sum;
	}

	_displayCaloriesBurned() {
		let sum = 0;

		this._workouts.forEach((workout) => {
			sum += workout.calories;
		});

		document.getElementById("calories-burned").innerText = sum;
	}

	_displayCaloriesGain() {
		document.getElementById("calories-total").innerText = this._totalCalories;
	}

	_displayCaloriesRemaining() {
		const cal_remaining = document.getElementById("calories-remaining");
		const progress = document.getElementById("calorie-progress");

		const remaining = this._dailyLimit - this._totalCalories;

		cal_remaining.innerText = remaining;

		if (remaining < 0) {
			// console.log(cal_remaining);
			cal_remaining.parentElement.parentElement.classList.remove("bg-light");
			cal_remaining.parentElement.parentElement.classList.add("bg-danger");
			cal_remaining.parentElement.parentElement.classList.add("text-white");
			progress.classList.add("bg-danger");
			progress.classList.remove("bg-success");
		} else {
			cal_remaining.parentElement.parentElement.classList.add("bg-light");
			cal_remaining.parentElement.parentElement.classList.remove("bg-danger");
			cal_remaining.parentElement.parentElement.classList.remove("text-white");
			progress.classList.remove("bg-danger");
			progress.classList.add("bg-success");
		}
	}

	_displayProgressBar() {
		let percentage;
		if (this._totalCalories < 0) percentage = 0;
		else percentage = (this._totalCalories * 100) / this._dailyLimit;

		// console.log(this._totalCalories);
		const progress = document.getElementById("calorie-progress");
		const width = Math.min(100, percentage);
		progress.style.width = `${width}%`;
	}

	_displayNewMeal(meal) {
		const mealsEl = document.getElementById("meal-items");
		const mealEl = document.createElement("div");
		mealEl.classList.add("card", "my-2");
		mealEl.setAttribute("data-id", meal.id);
		mealEl.innerHTML = `
		<div class="card-body">
		<div class="d-flex align-items-center justify-content-between">
		  <h4 class="mx-1">${meal.name}</h4>
		  <div
			class="fs-1 bg-primary text-white text-center rounded-2 px-2 px-sm-5"
		  >
			${meal.calories}
		  </div>
		  <button class="delete btn btn-danger btn-sm mx-2">
			<i class="fa-solid fa-xmark"></i>
		  </button>
		</div>
	  </div>
		`;

		mealsEl.appendChild(mealEl);
	}

	_displayNewWorkout(workout) {
		const workoutsEl = document.getElementById("workout-items");
		const workoutEl = document.createElement("div");
		workoutEl.classList.add("card", "my-2");
		workoutEl.setAttribute("data-id", workout.id);
		workoutEl.innerHTML = `
		<div class="card-body">
		<div class="d-flex align-items-center justify-content-between">
		  <h4 class="mx-1">${workout.name}</h4>
		  <div
			class="fs-1 bg-secondary text-white text-center rounded-2 px-2 px-sm-5"
		  >
			${workout.calories}
		  </div>
		  <button class="delete btn btn-danger btn-sm mx-2">
			<i class="fa-solid fa-xmark"></i>
		  </button>
		</div>
	  </div>
		`;

		workoutsEl.appendChild(workoutEl);
	}

	_render() {
		this._displayCaloriesConsumed();
		this._displayCaloriesBurned();
		this._displayCaloriesGain();
		this._displayDailyLimitCalorie();
		this._displayCaloriesRemaining();
		this._displayProgressBar();
	}
}

class Meal {
	constructor(name, calories) {
		this.name = name;
		this.calories = calories;
		this.id = Math.random().toString(16).slice(2);
	}
}

class Workout {
	constructor(name, calories) {
		this.name = name;
		this.calories = calories;
		this.id = Math.random().toString(16).slice(2);
	}
}

class Storage {
	static getCalorieLimit(defaultLimit = 2000) {
		let calorieLimit;

		if (localStorage.getItem("calorieLimit") === null) {
			calorieLimit = defaultLimit;
		} else {
			calorieLimit = +localStorage.getItem("calorieLimit");
		}

		return calorieLimit;
	}

	static setCalorieLimit(limit) {
		localStorage.setItem("calorieLimit", limit);
	}

	static getCalorieTotal() {
		let calorieTotal;

		if (localStorage.getItem("calorieTotal") === null) {
			calorieTotal = 0;
		} else {
			calorieTotal = +localStorage.getItem("calorieTotal");
		}

		return calorieTotal;
	}

	static updateCalorieTotal(total) {
		localStorage.setItem("calorieTotal", total);
	}

	static getMeals() {
		let meals;

		if (localStorage.getItem("meals") === null) {
			meals = [];
		} else {
			meals = JSON.parse(localStorage.getItem("meals"));
		}

		return meals;
	}

	static saveMeals(meal) {
		const meals = Storage.getMeals();
		meals.push(meal);

		localStorage.setItem("meals", JSON.stringify(meals));
	}

	static removeMeal(id) {
		const meals = Storage.getMeals();
		meals.forEach((meal, index) => {
			if (meal.id === id) {
				meals.splice(index, 1);
			}
		});

		localStorage.setItem("meals", JSON.stringify(meals));
	}

	static getWorkouts() {
		let workouts;

		if (localStorage.getItem("workouts") === null) {
			workouts = [];
		} else {
			workouts = JSON.parse(localStorage.getItem("workouts"));
		}

		return workouts;
	}

	static saveWorkouts(workout) {
		const workouts = Storage.getWorkouts();
		workouts.push(workout);

		localStorage.setItem("workouts", JSON.stringify(workouts));
	}

	static removeWorkout(id) {
		const workouts = Storage.getWorkouts();
		workouts.forEach((workout, index) => {
			if (workout.id === id) {
				workouts.splice(index, 1);
			}
		});

		localStorage.setItem("workouts", JSON.stringify(workouts));
	}

	static clearAll() {
		localStorage.removeItem("totalCalories");
		localStorage.removeItem("meals");
		localStorage.removeItem("workouts");

		// If you want to clear the limit
		// localStorage.clear();
	}
}

class App {
	constructor() {
		this._tracker = new CalorieTracker();
		this._loadListeners();
		this._tracker.loadItems();
	}

	_loadListeners() {
		document.getElementById("meal-form").addEventListener("submit", this._newItem.bind(this, "meal"));

		document.getElementById("workout-form").addEventListener("submit", this._newItem.bind(this, "workout"));

		document.getElementById("meal-items").addEventListener("click", this._removeItem.bind(this, "meal"));

		document.getElementById("workout-items").addEventListener("click", this._removeItem.bind(this, "workout"));

		document.getElementById("filter-meals").addEventListener("keyup", this._filterItems.bind(this, "meal"));

		document.getElementById("filter-workouts").addEventListener("keyup", this._filterItems.bind(this, "workout"));

		document.getElementById("limit-form").addEventListener("submit", this._setLimit.bind(this));

		document.getElementById("reset").addEventListener("click", this._reset.bind(this));
	}

	_newItem(type, e) {
		e.preventDefault();

		const name = document.getElementById(`${type}-name`);
		const calorie = document.getElementById(`${type}-calories`);

		if (name.value === "" || calorie.value === "") {
			alert("Please fill in all fields");
			return;
		}

		if (type === "meal") {
			const meal = new Meal(name.value, +calorie.value);
			this._tracker.addMeal(meal);
		} else {
			const workout = new Workout(name.value, +calorie.value);
			this._tracker.addWorkout(workout);
		}
		name.value = "";
		calorie.value = "";

		const collapseItem = document.getElementById(`collapse-${type}`);
		const bsCollapse = new bootstrap.Collapse(collapseItem, {
			toggle: true,
		});
	}

	_removeItem(type, e) {
		if (e.target.classList.contains("delete") || e.target.classList.contains("fa-xmark")) {
			const id = e.target.closest(".card").getAttribute("data-id");
			if (type === "meal") this._tracker.removeMeal(id);
			else this._tracker.removeWorkout(id);

			e.target.closest(".card").remove();
		}
	}
	_reset() {
		this._tracker.reset();
		document.getElementById("meal-items").innerHTML = "";
		document.getElementById("workout-items").innerHTML = "";
		document.getElementById("filter-meals").value = "";
		document.getElementById("filter-meals").value = "";
	}

	_filterItems(type, e) {
		const text = e.target.value.toLowerCase();
		console.log(text);
		document.querySelectorAll(`#${type}-items .card`).forEach((item) => {
			const name = item.firstElementChild.firstElementChild.textContent;

			if (name.toLowerCase().indexOf(text) !== -1) {
				item.style.display = "block";
			} else {
				item.style.display = "none";
			}
		});
	}

	_setLimit(e) {
		e.preventDefault();
		const limit = document.getElementById("limit");

		if (limit.value === "") {
			alert("set a value");
		}

		this._tracker.setDailyCalorieLimit(+limit.value);
		limit.value = "";

		const modalEl = document.getElementById("limit-modal");
		const modal = bootstrap.Modal.getInstance(modalEl);
		modal.hide();
	}
}

const app = new App();
