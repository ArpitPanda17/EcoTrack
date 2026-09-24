# =========================================================
# ECOTRACK
# Main R backend / Plumber API
# =========================================================


library(plumber)


# Load our analysis functions
source("analysis.R")


# CSV data file
data_file <- "data.csv"


# ---------------------------------------------------------
# CORS FILTER
# Allows the frontend to communicate with the R backend.
# ---------------------------------------------------------

#* @filter cors
function(req, res) {

    res$setHeader(
        "Access-Control-Allow-Origin",
        "*"
    )

    res$setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    )

    res$setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    )


    # Browser preflight request
    if (req$REQUEST_METHOD == "OPTIONS") {

        res$status <- 200

        return(
            list(message = "OK")
        )

    }


    forward()

}


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

#* Check whether the R backend is running
#* @get /api/health
function() {

    list(
        status = "ok",
        message = "EcoTrack R backend is running"
    )

}


# ---------------------------------------------------------
# ANALYZE USAGE
# ---------------------------------------------------------

#* Analyze and save household water usage
#* @post /api/analyze
function(req) {


    body <- req$argsBody


    tryCatch({

        result <-
            analyze_usage(

                date =
                    as.character(
                        body$date
                    ),

                people =
                    body$people,

                bathing_time =
                    body$bathing_time,

                baths_per_day =
                    body$baths_per_day,

                washing_loads_per_week =
                    body$washing_loads_per_week,

                hand_washing_liters =
                    body$hand_washing_liters,

                cleaning_liters =
                    body$cleaning_liters,

                gardening_liters =
                    body$gardening_liters,

                cooking_liters =
                    body$cooking_liters,

                other_liters =
                    body$other_liters

            )


        # Save result to CSV
        save_record(
            data_file,
            result
        )


        return(result)


    }, error = function(error) {

        list(
            error =
                error$message
        )

    })

}


# ---------------------------------------------------------
# GET SAVED HISTORY
# ---------------------------------------------------------

#* Get previously saved water usage records
#* @get /api/history
function() {


    history <-
        read_history(
            data_file
        )


    if (nrow(history) == 0) {

        return(list())

    }


    # Convert each row into a simple list.
    # This makes the JSON easy for JavaScript to use.

    result <- lapply(
        seq_len(nrow(history)),
        function(i) {

            list(

                date =
                    history$date[i],

                people =
                    history$people[i],

                bathing =
                    history$bathing[i],

                washing =
                    history$washing[i],

                cleaning =
                    history$cleaning[i],

                gardening =
                    history$gardening[i],

                cooking =
                    history$cooking[i],

                other =
                    history$other[i],

                total =
                    history$total[i]

            )

        }
    )


    return(result)


}
