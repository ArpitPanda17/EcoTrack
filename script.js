// ==========================================
// ECOTRACK
// Simple Frontend JavaScript
// ==========================================

const API_URL = "http://127.0.0.1:8000/api";

let historyData = [];

let trendChart = null;
let breakdownChart = null;
let analysisChart = null;


// ==========================================
// ACTIVITY NAMES
// ==========================================

const activityNames = {
    bathing: "Bathing",
    washing: "Washing",
    cleaning: "Cleaning",
    gardening: "Gardening",
    cooking: "Cooking & Drinking",
    other: "Other"
};


// ==========================================
// PAGE NAVIGATION
// ==========================================

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-page]");

navButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const pageName = button.getAttribute("data-page");

        pages.forEach(function (page) {
            page.classList.remove("active");
        });

        const selectedPage = document.getElementById(pageName);

        if (selectedPage) {
            selectedPage.classList.add("active");
        }

        document.querySelectorAll(".nav-item").forEach(function (item) {
            item.classList.remove("active");
        });

        if (button.classList.contains("nav-item")) {
            button.classList.add("active");
        }

        document.getElementById("sidebar").classList.remove("open");
    });

});


// ==========================================
// MOBILE MENU
// ==========================================

document.getElementById("menuButton").addEventListener("click", function () {

    document.getElementById("sidebar").classList.toggle("open");

});


// ==========================================
// SET TODAY'S DATE
// ==========================================

function setTodayDate() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    document.getElementById("date").value =
        year + "-" + month + "-" + day;
}

setTodayDate();


// ==========================================
// CHECK BACKEND
// ==========================================

async function checkBackend() {

    const statusText = document.getElementById("apiStatus");
    const statusDot = document.getElementById("statusDot");

    try {

        const response = await fetch(API_URL + "/health");

        if (!response.ok) {
            throw new Error("Backend not available");
        }

        statusText.textContent = "Backend connected";

        statusDot.classList.add("connected");
        statusDot.classList.remove("error");

    } catch (error) {

        statusText.textContent = "Backend offline";

        statusDot.classList.add("error");
        statusDot.classList.remove("connected");

        console.log(error);
    }
}


// ==========================================
// LOAD HISTORY FROM R
// ==========================================

async function loadHistory() {

    try {

        const response = await fetch(API_URL + "/history");

        if (!response.ok) {
            throw new Error("Could not load history");
        }

        historyData = await response.json();

        console.log("History loaded:", historyData);

        if (historyData.length > 0) {

            showLatestRecord();

            showTrendInformation();

            drawCharts();

        }

    } catch (error) {

        console.log("History error:", error);

    }
}


// ==========================================
// SHOW LATEST SAVED RECORD
// ==========================================

function showLatestRecord() {

    const latest =
        historyData[historyData.length - 1];

    const total =
        Number(latest.total);

    const people =
        Number(latest.people);


    const activities = {

        bathing: Number(latest.bathing),

        washing: Number(latest.washing),

        cleaning: Number(latest.cleaning),

        gardening: Number(latest.gardening),

        cooking: Number(latest.cooking),

        other: Number(latest.other)

    };


    const highestKey =
        Object.keys(activities).reduce(function (a, b) {

            return activities[a] > activities[b]
                ? a
                : b;

        });


    const percentage =
        total > 0
            ? (activities[highestKey] / total) * 100
            : 0;


    // Dashboard cards

    document.getElementById("dailyUsage").textContent =
        Math.round(total) + " L";


    const recentData =
        historyData.slice(-7);


    const recentTotal =
        recentData.reduce(function (sum, item) {

            return sum + Number(item.total);

        }, 0);


    const weeklyAverage =
        recentTotal / recentData.length;


    document.getElementById("weeklyAverage").textContent =
        Math.round(weeklyAverage) + " L";


    document.getElementById("monthlyEstimate").textContent =
        Math.round(total * 30).toLocaleString() + " L";


    document.getElementById("topActivity").textContent =
        activityNames[highestKey];


    document.getElementById("topActivityPercentage").textContent =
        percentage.toFixed(1) + "% of daily usage";


    // Dashboard observation

    document.getElementById("mainObservation").textContent =
        activityNames[highestKey] +
        " is your highest-use activity.";


    document.getElementById("mainObservationText").textContent =
        percentage.toFixed(1) +
        "% of your estimated daily usage comes from " +
        activityNames[highestKey].toLowerCase() +
        ".";


    // Analysis page

    document.getElementById("analysisDaily").textContent =
        Math.round(total) + " L";


    document.getElementById("analysisDate").textContent =
        "Analysis for " + formatDate(latest.date);


    document.getElementById("perPerson").textContent =
        (total / people).toFixed(1) + " L";


    const usageBand =
        getUsageBand(total / people);


    document.getElementById("usageStatus").textContent =
        usageBand;


    document.getElementById("usageStatusText").textContent =
        "This is the usage band calculated using the project reference thresholds.";


    document.getElementById("analysisObservation").textContent =
        activityNames[highestKey] +
        " contributes the largest share of your usage.";


    document.getElementById("analysisObservationText").textContent =
        percentage.toFixed(1) +
        "% of the estimated daily consumption comes from " +
        activityNames[highestKey].toLowerCase() +
        ".";


    // Insights

    document.getElementById("insightActivity").textContent =
        activityNames[highestKey];


    document.getElementById("insightActivityText").textContent =
        activityNames[highestKey] +
        " contributes approximately " +
        percentage.toFixed(1) +
        "% of the estimated daily water usage.";


    document.getElementById("insightSuggestion").textContent =
        getSuggestionTitle(highestKey);


    document.getElementById("insightSuggestionText").textContent =
        getSuggestionText(highestKey);

}


// ==========================================
// USAGE BAND
// ==========================================

function getUsageBand(perPerson) {

    if (perPerson < 100) {
        return "Low";
    }

    if (perPerson < 150) {
        return "Moderate";
    }

    if (perPerson < 200) {
        return "High";
    }

    return "Very High";
}


// ==========================================
// SUGGESTIONS
// ==========================================

function getSuggestionTitle(activity) {

    const titles = {

        bathing: "Review bathing time",

        washing: "Review laundry usage",

        cleaning: "Review cleaning habits",

        gardening: "Review garden watering",

        cooking: "Review kitchen water use",

        other: "Review other usage"

    };

    return titles[activity];
}


function getSuggestionText(activity) {

    const suggestions = {

        bathing:
            "Review bathing duration and avoid unnecessary water flow.",

        washing:
            "Review laundry frequency and avoid unnecessary washing loads.",

        cleaning:
            "Review cleaning routines and avoid using more water than needed.",

        gardening:
            "Check whether plants are being watered only when needed.",

        cooking:
            "Avoid leaving kitchen taps running unnecessarily.",

        other:
            "Review the activities included in Other and identify possible areas for reduction."

    };

    return suggestions[activity];
}


// ==========================================
// DRAW CHARTS
// ==========================================

function drawCharts() {

    if (historyData.length === 0) {
        return;
    }

    drawTrendChart();

    drawBreakdownChart();

}


// ==========================================
// TREND CHART
// ==========================================

function drawTrendChart() {

    const recentData =
        historyData.slice(-7);


    const labels =
        recentData.map(function (item) {

            return shortDate(item.date);

        });


    const values =
        recentData.map(function (item) {

            return Number(item.total);

        });


    const context =
        document.getElementById("trendChart");


    if (trendChart) {
        trendChart.destroy();
    }


    trendChart = new Chart(context, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                borderColor: "#087F8C",

                backgroundColor: "rgba(8, 127, 140, 0.08)",

                fill: true,

                tension: 0.35,

                pointRadius: 4,

                pointBackgroundColor: "#087F8C"

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {

                    beginAtZero: false,

                    grid: {
                        color: "#edf1f1"
                    }

                },

                x: {

                    grid: {
                        display: false
                    }

                }

            }

        }

    });

}


// ==========================================
// BREAKDOWN CHART
// ==========================================

function drawBreakdownChart() {

    const latest =
        historyData[historyData.length - 1];


    const values = [

        Number(latest.bathing),

        Number(latest.washing),

        Number(latest.cleaning),

        Number(latest.gardening),

        Number(latest.cooking),

        Number(latest.other)

    ];


    const labels = [

        "Bathing",

        "Washing",

        "Cleaning",

        "Gardening",

        "Cooking & Drinking",

        "Other"

    ];


    const colors = [

        "#087F8C",

        "#4CAF78",

        "#6DA9B7",

        "#8BC79E",

        "#A7C9D0",

        "#B9B6A9"

    ];


    const context =
        document.getElementById("breakdownChart");


    if (breakdownChart) {
        breakdownChart.destroy();
    }


    breakdownChart = new Chart(context, {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: colors,

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "68%",

            plugins: {

                legend: {
                    display: false
                }

            }

        }

    });


    // Legend

    const legend =
        document.getElementById("breakdownLegend");


    legend.innerHTML = "";


    labels.forEach(function (label, index) {

        const item =
            document.createElement("div");


        item.className = "legend-item";


        item.innerHTML =
            '<span class="legend-dot" ' +
            'style="background:' + colors[index] + '">' +
            '</span>' +
            '<span>' +
            label +
            " — " +
            Math.round(values[index]) +
            " L</span>";


        legend.appendChild(item);

    });

}


// ==========================================
// ANALYSIS BAR CHART
// ==========================================

function drawAnalysisChart(result) {

    const labels = [

        "Bathing",
        "Washing",
        "Cleaning",
        "Gardening",
        "Cooking",
        "Other"

    ];


    const values = [

        Number(result.activity_values.bathing),

        Number(result.activity_values.washing),

        Number(result.activity_values.cleaning),

        Number(result.activity_values.gardening),

        Number(result.activity_values.cooking),

        Number(result.activity_values.other)

    ];


    const context =
        document.getElementById("analysisChart");


    if (analysisChart) {
        analysisChart.destroy();
    }


    analysisChart = new Chart(context, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: "#087F8C",

                borderRadius: 7

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    grid: {
                        color: "#edf1f1"
                    }

                },

                x: {

                    grid: {
                        display: false
                    }

                }

            }

        }

    });

}


// ==========================================
// UPDATE TREND INFORMATION
// ==========================================

function showTrendInformation() {

    const values =
        historyData.map(function (item) {

            return Number(item.total);

        });


    if (values.length === 0) {
        return;
    }


    const average =
        values.reduce(function (sum, value) {

            return sum + value;

        }, 0) / values.length;


    const highest =
        Math.max(...values);


    const lowest =
        Math.min(...values);


    document.getElementById("trendAverage").textContent =
        Math.round(average) + " L";


    document.getElementById("trendHighest").textContent =
        Math.round(highest) + " L";


    document.getElementById("trendLowest").textContent =
        Math.round(lowest) + " L";


    if (values.length >= 2) {

        const previous =
            values[values.length - 2];

        const latest =
            values[values.length - 1];


        if (latest > previous) {

            document.getElementById("trendNote").textContent =
                "The latest recorded usage is higher than the previous record.";

        } else if (latest < previous) {

            document.getElementById("trendNote").textContent =
                "The latest recorded usage is lower than the previous record.";

        } else {

            document.getElementById("trendNote").textContent =
                "The latest recorded usage is similar to the previous record.";

        }

    }

}


// ==========================================
// FORM SUBMISSION
// ==========================================

document.getElementById("usageForm").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const message =
            document.getElementById("formMessage");


        const data = {

            date:
                document.getElementById("date").value,

            people:
                Number(
                    document.getElementById("people").value
                ),

            bathing_time:
                Number(
                    document.getElementById("bathingTime").value
                ),

            baths_per_day:
                Number(
                    document.getElementById("bathsPerDay").value
                ),

            washing_loads_per_week:
                Number(
                    document.getElementById("washingLoads").value
                ),

            hand_washing_liters:
                Number(
                    document.getElementById("handWashing").value
                ),

            cleaning_liters:
                Number(
                    document.getElementById("cleaning").value
                ),

            gardening_liters:
                Number(
                    document.getElementById("gardening").value
                ),

            cooking_liters:
                Number(
                    document.getElementById("cooking").value
                ),

            other_liters:
                Number(
                    document.getElementById("other").value
                )

        };


        message.className =
            "form-message show success";

        message.textContent =
            "Sending data to R...";


        try {

            const response =
                await fetch(API_URL + "/analyze", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(data)

                });


            const result =
                await response.json();


            if (!response.ok || result.error) {

                throw new Error(
                    result.error || "Analysis failed"
                );

            }


            // Update UI immediately

            document.getElementById("dailyUsage").textContent =
                Math.round(result.daily_usage) + " L";


            document.getElementById("monthlyEstimate").textContent =
                Math.round(result.monthly_estimate).toLocaleString() + " L";


            document.getElementById("topActivity").textContent =
                activityNames[result.highest_activity];


            document.getElementById("topActivityPercentage").textContent =
                result.highest_percentage +
                "% of daily usage";


            document.getElementById("analysisDaily").textContent =
                Math.round(result.daily_usage) + " L";


            document.getElementById("analysisDate").textContent =
                "Analysis for " +
                formatDate(result.date);


            document.getElementById("perPerson").textContent =
                result.per_person.toFixed(1) + " L";


            document.getElementById("usageStatus").textContent =
                result.usage_band;


            document.getElementById("usageStatusText").textContent =
                result.usage_band_note;


            document.getElementById("analysisObservation").textContent =
                activityNames[result.highest_activity] +
                " contributes the largest share of your usage.";


            document.getElementById("analysisObservationText").textContent =
                result.highest_percentage +
                "% of estimated daily usage comes from " +
                activityNames[result.highest_activity].toLowerCase() +
                ".";


            document.getElementById("mainObservation").textContent =
                activityNames[result.highest_activity] +
                " is your highest-use activity.";


            document.getElementById("mainObservationText").textContent =
                result.highest_percentage +
                "% of estimated daily usage comes from " +
                activityNames[result.highest_activity].toLowerCase() +
                ".";


            document.getElementById("insightActivity").textContent =
                activityNames[result.highest_activity];


            document.getElementById("insightActivityText").textContent =
                result.highest_percentage +
                "% of estimated daily water usage comes from " +
                activityNames[result.highest_activity].toLowerCase() +
                ".";


            document.getElementById("insightSuggestion").textContent =
                result.suggestion_title;


            document.getElementById("insightSuggestionText").textContent =
                result.suggestion;


            // Draw analysis chart

            drawAnalysisChart(result);


            // Reload saved records

            await loadHistory();


            // Go to analysis page

            showPage("analysis");


            message.className =
                "form-message show success";

            message.textContent =
                "Usage analyzed and saved successfully.";

        } catch (error) {

            console.log("Analysis error:", error);


            message.className =
                "form-message show error";


            message.textContent =
                "Could not connect to the R analysis. Check the R Console for an error.";

        }

    }
);


// ==========================================
// DATE HELPERS
// ==========================================

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function shortDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );

}


// ==========================================
// START APPLICATION
// ==========================================

async function startApp() {

    await checkBackend();

    await loadHistory();

}

startApp();