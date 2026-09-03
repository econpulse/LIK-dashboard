# ==============================================================================
# app.R
# R Shiny Backend für das Schweizer BFS CPI (LIK) Makrodaten-Dashboard
# ==============================================================================

suppressPackageStartupMessages({
  library(shiny)
  library(openxlsx)
  library(jsonlite)
})

# Lade die Extraktions-Funktion
source("extract_cpi_data.R")

# Maximale Upload-Größe auf 50 MB erhöhen (BFS-Dateien sind ~6 MB)
options(shiny.maxRequestSize = 50 * 1024^2)

# Startup-Check: Falls noch kein JSON existiert, initial aus vorhandener .xlsx generieren
init_data_if_missing <- function() {
  json_main <- file.path("www", "data", "cpi_data.json")
  json_summary <- file.path("www", "data", "cpi_summary.json")
  
  if (!file.exists(json_main) || !file.exists(json_summary)) {
    message("[Shiny Startup] Keine fertigen JSON-Dateien gefunden. Suche nach Excel-Quelldatei...")
    xlsx_files <- list.files(".", pattern = "\\.xlsx$", full.names = TRUE)
    if (length(xlsx_files) > 0) {
      sample_file <- xlsx_files[1]
      message(sprintf("[Shiny Startup] Verarbeite gefundene Datei: %s", sample_file))
      tryCatch({
        extract_cpi_file(sample_file, output_dir = "www/data")
      }, error = function(e) {
        warning(sprintf("[Shiny Startup] Fehler bei Initial-Extraktion: %s", e$message))
      })
    } else {
      warning("[Shiny Startup] Keine .xlsx Datei im Arbeitsverzeichnis gefunden!")
    }
  } else {
    message("[Shiny Startup] Bestehende JSON-Dateien in www/data/ sind vorhanden und einsatzbereit.")
  }
}

init_data_if_missing()

# ==============================================================================
# UI: Nutzt das reine HTML5 Template in www/index.html
# ==============================================================================
ui <- htmlTemplate(
  "www/index.html",
  upload_control = fileInput(
    "cpi_file_upload",
    label = NULL,
    accept = c(".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    buttonLabel = "Datei wählen",
    placeholder = "Keine Datei ausgewählt"
  )
)

# ==============================================================================
# Server: Verarbeitet Dateiuploads und stößt Extraktion an
# ==============================================================================
server <- function(input, output, session) {
  
  observeEvent(input$cpi_file_upload, {
    req(input$cpi_file_upload)
    
    uploaded_file <- input$cpi_file_upload
    file_path <- uploaded_file$datapath
    orig_name <- uploaded_file$name
    file_size_mb <- round(uploaded_file$size / (1024 * 1024), 2)
    
    message(sprintf("[Upload] Datei empfangen: '%s' (%0.2f MB)", orig_name, file_size_mb))
    
    tryCatch({
      # Extraktion ausführen und www/data/ aktualisieren
      res <- extract_cpi_file(file_path, output_dir = "www/data")
      
      msg_text <- sprintf("Erfolgreich geladen: Stand %s (%d Monate, %d Positionen)", 
                          res$meta$latest_date, res$meta$total_months, length(res$items))
      message(sprintf("[Upload Success] %s", msg_text))
      
      session$sendCustomMessage("upload_complete", list(
        status = "success",
        filename = orig_name,
        latest_date = res$meta$latest_date,
        total_months = res$meta$total_months,
        message = msg_text
      ))
      
    }, error = function(e) {
      err_msg <- sprintf("Fehler bei der BFS-Verarbeitung: %s", e$message)
      message(sprintf("[Upload Error] %s", err_msg))
      
      session$sendCustomMessage("upload_complete", list(
        status = "error",
        filename = orig_name,
        message = err_msg
      ))
    })
  })
}

# App-Definition
shinyApp(ui = ui, server = server)
