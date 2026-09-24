FROM rocker/r-ver:4.6.1

WORKDIR /app/backend

RUN R -e "install.packages('plumber', repos='https://cloud.r-project.org')"

COPY Backend/ ./

EXPOSE 10000

CMD ["R", "-e", "api <- plumber::plumb('app.r'); api$run(host='0.0.0.0', port=as.numeric(Sys.getenv('PORT', '10000')))"]