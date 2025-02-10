document.addEventListener("DOMContentLoaded", function () {
  loadHabits();
  updateHeatmap();
  loadingData();
  loadingfunction();
});
document.addEventListener("DOMContentLoaded", initLineGraph);
document.addEventListener("DOMContentLoaded", generateProgressBars);

let habitCompletionData = [];
/*used while testing*/
function loadingData() {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  console.log(DataStored);
}
/*function to activate or deactive (show or hid) the popup*/
function togglePopup() {
  let popup = document.getElementById("popup");
  popup.classList.toggle("show-popup");
}
/*loading function generally created for the pop-up to show at biginning in no user is created*/
function loadingfunction() {
  /*getting data stored*/
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  /*if else statement that help show pop- up at the biginning*/
  if (DataStored.length === 0) {
    document.getElementById("close-btn").style.display = "none";
    togglePopup();
  } else {
    /*here it does if no active user it shows guest at profile name as i limited the option to use it without creating profile its no that useful*/
    let activeUser = DataStored.find((user) => user.activestatus === true);
    document.getElementById("nameofuser").innerText =
      activeUser?.LoginName || "Guest";
    let userList = document.getElementById("user-list");
    /*loading the data into the page*/
    DataStored.forEach((user) => {
      let newUserItem = document.createElement("li");
      newUserItem.classList.add("user-item");
      let username = user.LoginName;

      let nameSpan = document.createElement("span");
      nameSpan.textContent = username;
      nameSpan.onclick = function () {
        selectUser(username);
      };

      let deleteIcon = document.createElement("i");
      deleteIcon.classList.add("fa", "fa-trash", "delete-icon");
      deleteIcon.onclick = function (event) {
        event.stopPropagation();
        deleteUser(newUserItem, username);
      };

      newUserItem.appendChild(nameSpan);
      newUserItem.appendChild(deleteIcon);
      userList.appendChild(newUserItem);
    });
  }
}
/*function for creating the data*/
function createUser() {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  let newUserInput = document.getElementById("new-username");
  let username = newUserInput.value.trim();
  if (DataStored.some((user) => user.LoginName === username)) {
    newUserInput.value = "";
    newUserInput.classList.add("forplaceholder");
    document.getElementsByName("Email")[0].placeholder = "new text for email";
    return;
  }
  if (username) {
    document.getElementById("close-btn").style.display = "unset";
    document.getElementById("nameofuser").innerText = username;
    togglePopup();
    let userList = document.getElementById("user-list");
    let newUserItem = document.createElement("li");
    newUserItem.classList.add("user-item");
    const userlogin = {
      lastupdated: "",
      LoginName: username,
      activestatus: true,
      HabitList: [],
    };

    DataStored.forEach((user) => (user.activestatus = false)); // Deactivate all users
    DataStored.push(userlogin);
    localStorage.setItem("DataStored", JSON.stringify(DataStored));

    let nameSpan = document.createElement("span");
    nameSpan.textContent = username;
    nameSpan.onclick = function () {
      selectUser(username);
    };

    let deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa", "fa-trash", "delete-icon");
    deleteIcon.onclick = function (event) {
      event.stopPropagation();
      deleteUser(newUserItem, username);
    };

    newUserItem.appendChild(nameSpan);
    newUserItem.appendChild(deleteIcon);
    userList.appendChild(newUserItem);
    newUserInput.value = ""; // Clear input field
  }
}

// Function to select a user
function selectUser(username) {
  let DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  // Deactivate all users
  DataStored.forEach((user) => {
    user.activestatus = user.LoginName === username;
  });
  localStorage.setItem("DataStored", JSON.stringify(DataStored));
  document.getElementById("nameofuser").textContent = username;
  togglePopup();
  loadHabits(); // Load habits for the selected user and update graph
}

// Function to delete a user
function deleteUser(userItem, username) {
  let DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  DataStored = DataStored.filter((user) => user.LoginName !== username);
  localStorage.setItem("DataStored", JSON.stringify(DataStored));
  document.getElementById("nameofuser").innerText = "";
  userItem.remove();
  deletehelp();
}
/*just used to help the delete function*/
function deletehelp() {
  let DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  document.getElementById("close-btn").style.display = "none";
}

// Adds a new habit
function addHabit() {
  const habitText = document.getElementById("new-habit").value;
  if (habitText.trim() !== "") {
    const habit = {
      HabitName: habitText,
      Streak: 0,
      completed: false,
      Dates: [],
      DateStatus: [],
    };
    let DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
    const activeUser = DataStored.find((user) => user.activestatus);
    const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
    habit.Dates.push(currentDate);
    habit.DateStatus.push(0); // Initially, the habit is not completed

    activeUser.HabitList.push(habit);
    localStorage.setItem("DataStored", JSON.stringify(DataStored));
    document.getElementById("new-habit").value = ""; // Clear input field
    toggleHabitInput();
    loadHabits(); // Reload habits after adding
  }
}

//  habit add input show or hide
function toggleHabitInput() {
  const habitInput = document.getElementById("habit-input");
  if (habitInput.style.display === "none") {
    habitInput.style.display = "block"; // Show the element
  } else {
    habitInput.style.display = "none"; // Hide the element
  }
}

// Load habits for the active user
function loadHabits() {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  const habitList = document.getElementById("habit-list");
  habitList.innerHTML = ""; // Clear existing habit list

  const activeUser = DataStored.find((user) => user.activestatus);
  if (!activeUser) return;

  const habits = activeUser.HabitList;

  habits.forEach((habit, index) => {
    const habitDiv = document.createElement("div");
    habitDiv.classList.add("habit");

    const currentDate = new Date().toISOString().split("T")[0]; // Get current date

    // finds the index of the current date in the Dates array
    const dateIndex = habit.Dates.indexOf(currentDate);

    // Creating the habit HTML
    habitDiv.innerHTML = `
        <input id="check-${index}" type="checkbox" ${
      habit.DateStatus[dateIndex] === 1 ? "checked" : ""
    } ${
      habit.DateStatus[dateIndex] === 1 ? "disabled" : ""
    } onchange="toggleCompletion(${index})"/>
        <label>${habit.HabitName}</label>
        <div class="streak ${getStreakColor(habit.Streak)}">${
      habit.Streak
    } day streak</div>
        <button class="delete-habit" onclick="deleteHabit(${index})" aria-label="Delete habit">Delete</button>
      `;
    habitList.appendChild(habitDiv);
  });

  // Update the stats after loading the habits
  updateStats(habits);

  // Update the last week's progress graph for the active user
  updateLastWeekProgressGraph(habits);
}

// Update the stats (total habits, completion rate)
function updateStats(habits) {
  document.getElementById("total-habits").textContent = habits.length;
  const completed = habits.filter((h) => h.DateStatus.includes(1)).length;
  if (habits.length > 0) {
    document.getElementById("completion-rate").textContent =
      Math.round((completed / habits.length) * 100) + "%";
  } else {
    document.getElementById("completion-rate").textContent = "0%";
  }
}

// Get the streak color based on the streak length
function getStreakColor(streak) {
  if (streak >= 10) return "green";
  if (streak >= 5) return "yellow";
  return "red";
}

// Toggle completion for a habit
async function toggleCompletion(index) {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  const activeUser = DataStored.find((user) => user.activestatus);
  if (!activeUser) return;

  let habits = activeUser.HabitList;
  const habit = habits[index];
  const currentDate = await getIndiaTime(); // Get the current date

  const dateIndex = habit.Dates.indexOf(currentDate); // Find the index of the current date in the Dates array

  // If the habit was already completed today, do nothing
  if (habit.DateStatus[dateIndex] === 1) {
    console.log("Already completed today, no change.");
    return;
  }

  habit.DateStatus[dateIndex] = 1; // Mark as completed (1) for today's date

  if (dateIndex > 0 && habit.DateStatus[dateIndex - 1] === 1) {
    // If the previous day was completed, increment the streak
    habit.Streak += 1;
  } else {
    // If the previous day was not completed, reset the streak to 1 (today's completion starts the streak)
    habit.Streak = 1;
  }

  // Save the updated data to localStorage
  localStorage.setItem("DataStored", JSON.stringify(DataStored));

  loadHabits(); // Reload habits to reflect the updated completion
}

// Deleting a habit
function deleteHabit(index) {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  const activeUser = DataStored.find((user) => user.activestatus);
  if (!activeUser) return;
  activeUser.HabitList.splice(index, 1);
  localStorage.setItem("DataStored", JSON.stringify(DataStored));
  loadHabits(); // Reload habits after deletion
}

// Fetch current date in India
async function getIndiaTime() {
  try {
    const response = await fetch("http://localhost:8080/current-date");
    if (!response.ok) {
      throw new Error("Failed to fetch time");
    }
    const data = await response.json();
    let CurrentDate = data.current_date;
    return CurrentDate;
  } catch (error) {
    console.error("Error fetching time:", error);
  }
}

// Update the last week's progress graph
function updateLastWeekProgressGraph(habits) {
  const last7Days = getLast7Days();
  const completedCounts = last7Days.map((date) => {
    return countCompletedHabits(habits, date);
  });

  const ctx = document.getElementById("progressChart").getContext("2d");

  //  Check if a chart exists and destroy it
  if (window.myLineChart) {
    window.myLineChart.destroy();
  }

  window.myLineChart = new Chart(ctx, {
    // Assign the chart to the global variable
    type: "bar",
    data: {
      labels: last7Days,
      datasets: [
        {
          label: "Completed Habits",
          data: completedCounts,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Completed Habits",
          },
        },
      },
    },
  });
}

// Getting the last 7 days data
function getLast7Days() {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    let date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]); //  correct date format
  }
  return dates;
}

// Counting how many habits were completed on a specific date
function countCompletedHabits(habits, date) {
  let count = 0;
  habits.forEach((habit) => {
    const dateIndex = habit.Dates.indexOf(date);
    if (dateIndex !== -1 && habit.DateStatus[dateIndex] === 1) {
      count++;
    }
  });
  return count;
}
//updates the heat map for data
function updateHeatmap() {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  const activeUser = DataStored.find((user) => user.activestatus);
  // if No active user or no habits
  if (!activeUser || !activeUser.HabitList.length) {
    return;
  }

  const habits = activeUser.HabitList;
  const today = new Date();
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setMonth(today.getMonth() - 2); // Set the date to 2 months ago
  // Generate data for the heatmap: Each day from 2 months ago to today with completed habits count
  const heatmapData = generateHeatmapData(habits, twoMonthsAgo, today);
  // its a template from online in heatmap extension
  // Heatmap data and options
  const options = {
    chart: {
      type: "heatmap",
      height: 350,
    },
    series: [
      {
        name: "Habits Completed",
        data: heatmapData, // Data for the heatmap (dates and completed habits)
      },
    ],
    title: {
      text: "Habit Completion Heatmap (Last 2 Months)",
    },
    xaxis: {
      type: "datetime", // Use datetime for X axis to represent days
      labels: {
        show: true,
        rotate: -45, // Rotate labels to avoid overlap
      },
    },
    yaxis: {
      show: false, // Hide Y axis
    },
    dataLabels: {
      enabled: false, // Disable data labels to show only colored squares
    },
    colors: ["#AEEEEE", "#00CED1", "#20B2AA", "#008B8B", "#00688B"], // Blue color scale
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " habits"; // Tooltip displaying number of habits
        },
      },
    },
    plotOptions: {
      heatmap: {
        radius: 2, // Adjust the radius to make cells more square-like
        enableShades: true, // Make sure shading works to show gradient effect
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 1,
              name: "Low",
              color: "#e1e8fb", // Light blue
            },
            {
              from: 2,
              to: 2,
              name: "Medium",
              color: "#d9e2fa", // Medium blue
            },
            {
              from: 3,
              to: 3,
              name: "High",
              color: "#9eb0e5", // Stronger blue
            },
            {
              from: 4,
              to: 4,
              name: "Very High",
              color: "#6b85d8", // Darker blue
            },
            {
              from: 5,
              to: 9000,
              name: "Extreme",
              color: "#3e5fcc", // Deep blue
            },
          ],
        },
      },
    },
  };

  // Rendering the heatmap
  const chart = new ApexCharts(document.querySelector("#heatmap"), options);
  chart.render();
}

// Generate heatmap data from habit completion within the date range
function generateHeatmapData(habits, startDate, endDate) {
  const heatmapData = [];
  const currentDate = new Date(startDate);

  // Iterate from 2 months ago to today
  while (currentDate <= endDate) {
    const formattedDate = currentDate.toISOString().split("T")[0]; // Format as date
    let completedCount = 0;
    habits.forEach((habit) => {
      const dateIndex = habit.Dates.indexOf(formattedDate);
      if (dateIndex !== -1 && habit.DateStatus[dateIndex] === 1) {
        completedCount++;
      }
    });

    // Push data for the heatmap
    heatmapData.push({
      x: currentDate.getTime(),
      y: completedCount,
    });

    // Increment the currentDate to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return heatmapData;
}

// Function to initialize the graph and event listeners
function initLineGraph() {
  const habitSelector = document.getElementById("habit-selector");
  const timeRangeSelector = document.getElementById("time-range-selector");

  habitSelector.addEventListener("change", updateLineGraph);
  timeRangeSelector.addEventListener("change", updateLineGraph);

  // Load habits into the selector
  loadHabitsIntoSelector();

  // Initially load the graph
  updateLineGraph();
}

// Loading all the habits into the habit selector
function loadHabitsIntoSelector() {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  const activeUser = DataStored.find((user) => user.activestatus);

  if (!activeUser || !activeUser.HabitList.length) {
    return; // No active user or no habits
  }

  const habitSelector = document.getElementById("habit-selector");
  activeUser.HabitList.forEach((habit) => {
    const option = document.createElement("option");
    option.value = habit.HabitName;
    option.textContent = habit.HabitName;
    habitSelector.appendChild(option);
  });
}

// Function to update the line graph based on the selected habit and time range
function updateLineGraph() {
  const habitSelector = document.getElementById("habit-selector");
  const timeRangeSelector = document.getElementById("time-range-selector");

  const selectedHabit = habitSelector.value;
  const selectedRange = timeRangeSelector.value;

  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  const activeUser = DataStored.find((user) => user.activestatus);

  if (!activeUser || !activeUser.HabitList.length) {
    return; // No active user or no habits
  }

  const habits = activeUser.HabitList;
  const selectedHabitData =
    selectedHabit === "all"
      ? habits
      : habits.filter((habit) => habit.HabitName === selectedHabit);

  let startDate, endDate;

  // Set the start and end dates
  if (selectedRange === "last-month") {
    const today = new Date();
    endDate = new Date(today);
    startDate = new Date(today.setMonth(today.getMonth() - 1)); // 1 month ago
  } else if (selectedRange === "last-year") {
    const today = new Date();
    endDate = new Date(today);
    startDate = new Date(today.setFullYear(today.getFullYear() - 1)); // 1 year ago
  } else if (selectedRange === "overall") {
    const allDates = habits.flatMap((habit) => habit.Dates);
    startDate = new Date(
      Math.min(...allDates.map((date) => new Date(date).getTime()))
    ); // Earliest date
    endDate = new Date(); // Today's date
  }

  // Generate the data for the line graph
  const lineGraphData = generateLineGraphData(
    selectedHabitData,
    startDate,
    endDate
  );

  // Line graph options
  const options = {
    chart: {
      type: "line",
      height: 350,
    },
    series: [
      {
        name: "Habit Completion",
        data: lineGraphData, // Data for the line graph
      },
    ],
    title: {
      text: `${
        selectedHabit === "all" ? "All Habits" : selectedHabit
      } Habit Completion (${selectedRange.replace("-", " ").toUpperCase()})`,
    },
    xaxis: {
      type: "datetime",
      title: {
        text: "Date",
      },
      labels: {
        show: true,
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: "Habit Done (1) / Not Done (0)",
      },
      min: 0,
      max: 1,
    },
    dataLabels: {
      enabled: false,
    },
  };

  // Initialize the line graph
  const chart = new ApexCharts(document.querySelector("#line-chart"), options);
  chart.render();
}

// Function to generate the data
function generateLineGraphData(habits, startDate, endDate) {
  const data = [];
  const habitCompletionPerDay = {};

  // Loop through each habit to check completion status for each day
  habits.forEach((habit) => {
    const { HabitName, Dates, DateStatus } = habit;
    Dates.forEach((date, index) => {
      const dateObj = new Date(date);
      if (dateObj >= startDate && dateObj <= endDate) {
        const timestamp = dateObj.getTime();

        // Set the completion status as 1 or 0 (done or not done)
        const status = DateStatus[index] === 1 ? 1 : 0;

        // Store the completion status for the day
        if (!habitCompletionPerDay[timestamp]) {
          habitCompletionPerDay[timestamp] = [];
        }
        habitCompletionPerDay[timestamp].push(status);
      }
    });
  });

  // Convert the habitCompletionPerDay to chart
  for (const timestamp in habitCompletionPerDay) {
    const completedCount = habitCompletionPerDay[timestamp].reduce(
      (acc, status) => acc + status,
      0
    );
    data.push({
      x: parseInt(timestamp),
      y: completedCount,
    });
  }

  // Sort data by date
  data.sort((a, b) => a.x - b.x);
  return data;
}

// Function to generate and display progress bars for each habit
function generateProgressBars() {
  const DataStored = JSON.parse(localStorage.getItem("DataStored")) || [];
  const activeUser = DataStored.find((user) => user.activestatus);

  if (!activeUser || !activeUser.HabitList.length) {
    return;
  }

  const habits = activeUser.HabitList;

  const progressBarContainer = document.getElementById("habit-progress-bars");
  progressBarContainer.innerHTML = "";

  // Loop through each habit to create a progress bar
  habits.forEach((habit) => {
    const { HabitName, Dates, DateStatus } = habit;

    // Calculate the number of completed days
    const completedDays = DateStatus.filter((status) => status === 1).length;
    const totalDays = Dates.length;

    // Calculate the completion rate
    const completionRate = completedDays / totalDays;

    // Determine the color based on completion rate
    let barColor = "#4caf50"; // Default color (Green)
    if (completionRate < 0.25) {
      barColor = "#f44336"; // Red
    } else if (completionRate >= 0.25 && completionRate < 0.75) {
      barColor = "#2196F3"; // Blue
    } else if (completionRate >= 0.75) {
      barColor = "#4caf50"; // Green
    }

    // Creating the container
    const habitContainer = document.createElement("div");
    habitContainer.classList.add("habit-progress-container");
    habitContainer.innerHTML = `
      <h4>${HabitName}</h4>
      <div id="progress-bar-${HabitName.replace(
        /\s/g,
        ""
      )}" class="progress-bar"></div>
      <p>Completed: ${completedDays} / ${totalDays} (${(
      completionRate * 100
    ).toFixed(2)}%)</p>
    `;

    progressBarContainer.appendChild(habitContainer);

    // Create the progress bar using ProgressBar.js
    const progressBar = new ProgressBar.Line(
      `#progress-bar-${HabitName.replace(/\s/g, "")}`,
      {
        strokeWidth: 4,
        color: barColor, // Use the dynamically set color
        trailColor: "#eee", // Light grey trail
        duration: 1400,
        easing: "easeInOut",
        text: {
          value: `${(completionRate * 100).toFixed(2)}%`,
        },
      }
    );

    progressBar.animate(completionRate);
  });
}
