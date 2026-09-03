# ==============================================================================
# extract_cpi_data.R
# Extrahiert BFS Konsumentenpreis-Daten (LIK) aus .xlsx in JSON für das Dashboard
# ==============================================================================

suppressPackageStartupMessages({
  library(readxl)
  library(jsonlite)
})

parse_excel_date_col <- function(x) {
  num <- suppressWarnings(as.numeric(x))
  if (!is.na(num) && num > 20000 && num < 60000) {
    d <- as.Date(num, origin = "1899-12-30")
    return(format(d, "%Y-%m"))
  }
  d <- suppressWarnings(as.Date(x))
  if (!is.na(d)) return(format(d, "%Y-%m"))
  if (grepl("^\\d{4}-\\d{2}$", x)) return(x)
  return(as.character(x))
}

clean_num_vector <- function(v) {
  vals <- suppressWarnings(as.numeric(v))
  round(vals, 2)
}

extract_cpi_file <- function(xlsx_path, output_dir = "www/data") {
  cat(sprintf("[CPI Extractor] Verarbeite Datei: %s\n", xlsx_path))
  t0 <- Sys.time()
  
  if (!file.exists(xlsx_path)) {
    stop(sprintf("Datei nicht gefunden: %s", xlsx_path))
  }
  
  sheet_names <- excel_sheets(xlsx_path)
  cat(sprintf("[CPI Extractor] Vorhandene Sheets: %s\n", paste(sheet_names, collapse = ", ")))
  
  # 1. Metadaten aus den ersten Zeilen von INDEX_m extrahieren
  raw_header <- as.data.frame(read_excel(xlsx_path, sheet = "INDEX_m", n_max = 4, col_names = FALSE, .name_repair = "minimal"))
  title_de <- as.character(raw_header[1, 1])
  basket_str <- as.character(raw_header[2, 1])
  base_str <- as.character(raw_header[3, 1])
  
  cat(sprintf("[CPI Extractor] Titel: %s | %s | %s\n", title_de, basket_str, base_str))
  
  # 2. Relevante Sheets einlesen (Header in Zeile 4 -> skip = 3)
  idx_df <- as.data.frame(read_excel(xlsx_path, sheet = "INDEX_m", skip = 3, .name_repair = "minimal"))
  var_m1_df <- as.data.frame(read_excel(xlsx_path, sheet = "VAR_m-1", skip = 3, .name_repair = "minimal"))
  var_m12_df <- as.data.frame(read_excel(xlsx_path, sheet = "VAR_m-12", skip = 3, .name_repair = "minimal"))
  
  contr_df <- if ("CONTR_m" %in% sheet_names) {
    as.data.frame(read_excel(xlsx_path, sheet = "CONTR_m", skip = 3, .name_repair = "minimal"))
  } else NULL
  
  # Bereinigen von Leer- und Fußnotenzeilen am Ende
  idx_df <- idx_df[!is.na(idx_df[["Position_D"]]), ]
  var_m1_df <- var_m1_df[!is.na(var_m1_df[["Position_D"]]), ]
  var_m12_df <- var_m12_df[!is.na(var_m12_df[["Position_D"]]), ]
  if (!is.null(contr_df)) contr_df <- contr_df[!is.na(contr_df[["Position_D"]]), ]
  
  # 3. Datumsspalten identifizieren
  weight_col_name <- names(idx_df)[14]
  date_raw_cols <- names(idx_df)[15:ncol(idx_df)]
  parsed_dates <- unname(sapply(date_raw_cols, parse_excel_date_col))
  
  # Gültigen Datumsbereich anhand des Gesamtindex (Code 100_100) bestimmen
  tot_idx_row <- idx_df[idx_df[["Code"]] == "100_100", ][1, ]
  tot_vals <- suppressWarnings(as.numeric(tot_idx_row[date_raw_cols]))
  valid_indices <- which(!is.na(tot_vals))
  
  if (length(valid_indices) == 0) {
    stop("Konnte keine gültigen Zeitreihendaten für den Gesamtindex finden.")
  }
  
  last_valid_idx <- max(valid_indices)
  valid_date_cols <- date_raw_cols[1:last_valid_idx]
  valid_dates <- parsed_dates[1:last_valid_idx]
  latest_date <- valid_dates[last_valid_idx]
  
  cat(sprintf("[CPI Extractor] Datumsbereich: %s bis %s (%d Monate)\n", 
              valid_dates[1], latest_date, length(valid_dates)))
  
  # Datumsspalten für Beiträge (CONTR_m)
  contr_date_cols <- character(0)
  contr_dates <- character(0)
  if (!is.null(contr_df)) {
    c_raw <- names(contr_df)[15:ncol(contr_df)]
    c_parsed <- unname(sapply(c_raw, parse_excel_date_col))
    c_valid <- which(c_parsed %in% valid_dates)
    if (length(c_valid) > 0) {
      contr_date_cols <- c_raw[c_valid]
      contr_dates <- c_parsed[c_valid]
    }
  }
  
  # 4. Hierarchie-Erkennung & Aufteilung in COICOP-Baum und Sondergliederungen
  # Im BFS-Excel gibt es:
  # 1. Den detaillierten COICOP-Baum (Zeile 1 bis 568, vor dem zweiten "100_100")
  # 2. Eine redundante Übersicht der 13 Hauptgruppen (Zeile 569 bis 582)
  # 3. Die Sondergliederungen (ab 110_101, Zeile 583 bis Ende)
  tot_rows <- which(idx_df[["Code"]] == "100_100")
  special_first <- which(idx_df[["Code"]] == "110_101")[1]
  
  if (length(tot_rows) > 1) {
    coicop_end_idx <- tot_rows[2] - 1
  } else if (!is.na(special_first)) {
    coicop_end_idx <- special_first - 1
  } else {
    lvl_na <- which(is.na(idx_df[["Level"]]))
    coicop_end_idx <- if (length(lvl_na) > 0) min(lvl_na) - 1 else nrow(idx_df)
  }

  special_start_idx <- if (!is.na(special_first)) special_first else coicop_end_idx + 1
  
  coicop_df <- idx_df[1:coicop_end_idx, ]
  special_df <- if (special_start_idx <= nrow(idx_df)) idx_df[special_start_idx:nrow(idx_df), ] else data.frame()
  
  cat(sprintf("[CPI Extractor] COICOP Zeilen: %d | Sondergliederungen Zeilen: %d\n", 
              nrow(coicop_df), nrow(special_df)))
  
  # 5. Parent-Child Beziehungen für den COICOP-Baum aufbauen
  parents <- character(nrow(coicop_df))
  stack_code <- character(15)
  stack_level <- integer(15)
  top <- 0
  
  for (i in seq_len(nrow(coicop_df))) {
    lvl <- coicop_df[["Level"]][i]
    code <- coicop_df[["Code"]][i]
    
    while (top > 0 && stack_level[top] >= lvl) {
      top <- top - 1
    }
    if (top > 0) {
      parents[i] <- stack_code[top]
    } else {
      parents[i] <- NA_character_
    }
    top <- top + 1
    stack_code[top] <- code
    stack_level[top] <- lvl
  }
  
  children_map <- list()
  for (i in seq_len(nrow(coicop_df))) {
    p <- parents[i]
    c_code <- coicop_df[["Code"]][i]
    if (!is.na(p)) {
      children_map[[p]] <- c(children_map[[p]], c_code)
    }
  }

  # Bereinigung technischer 1:1 Blätter des BFS:
  # Hat eine Position genau 1 Kind ohne eigene Kinder und identischem Namen,
  # ist das Kind ein technisches Duplikat. Die Position selbst wird zum echten Blatt.
  for (i in seq_len(nrow(coicop_df))) {
    code <- coicop_df[["Code"]][i]
    ch <- children_map[[code]]
    if (length(ch) == 1) {
      ch_code <- ch[1]
      ch_idx <- which(coicop_df[["Code"]] == ch_code)[1]
      ch_grand <- children_map[[ch_code]]
      if (length(ch_grand) == 0 && !is.na(ch_idx)) {
        p_name <- trimws(as.character(coicop_df[["Position_D"]][i]))
        c_name <- trimws(as.character(coicop_df[["Position_D"]][ch_idx]))
        if (tolower(p_name) == tolower(c_name)) {
          # Kind entfernen: parent ist echtes Blatt
          children_map[[code]] <- character(0)
        }
      }
    }
  }
  
  # 6. Lookup für VAR_m1, VAR_m12 und CONTR_m erstellen
  var1_mat <- as.matrix(var_m1_df[, valid_date_cols])
  var12_mat <- as.matrix(var_m12_df[, valid_date_cols])
  idx_mat <- as.matrix(idx_df[, valid_date_cols])
  
  # Indizes des Gesamtindex (100_100) für YoY-Beitragsberechnung
  tot_row_idx <- which(idx_df[["Code"]] == "100_100")[1]
  I_tot_t <- suppressWarnings(as.numeric(idx_mat[tot_row_idx, last_valid_idx]))
  I_tot_t12 <- if (last_valid_idx > 12) suppressWarnings(as.numeric(idx_mat[tot_row_idx, last_valid_idx - 12])) else NA_real_
  headline_yoy_t <- if (!is.na(I_tot_t) && !is.na(I_tot_t12) && I_tot_t12 > 0) (I_tot_t - I_tot_t12) / I_tot_t12 * 100 else NA_real_

  # Vormonat für Delta-Berechnung
  prev_idx <- last_valid_idx - 1
  I_tot_prev <- if (prev_idx >= 1) suppressWarnings(as.numeric(idx_mat[tot_row_idx, prev_idx])) else NA_real_
  I_tot_prev12 <- if (prev_idx > 12) suppressWarnings(as.numeric(idx_mat[tot_row_idx, prev_idx - 12])) else NA_real_
  headline_yoy_prev <- if (!is.na(I_tot_prev) && !is.na(I_tot_prev12) && I_tot_prev12 > 0) (I_tot_prev - I_tot_prev12) / I_tot_prev12 * 100 else NA_real_

  build_item_object <- function(df_row, row_idx, parent_code = NA_character_, 
                                children = character(0), group_type = "coicop") {
    code <- as.character(df_row[["Code"]])
    pos_no <- suppressWarnings(as.numeric(df_row[["PosNo"]]))
    pos_type <- suppressWarnings(as.numeric(df_row[["PosType"]]))
    lvl <- suppressWarnings(as.numeric(df_row[["Level"]]))
    coicop <- as.character(df_row[["COICOP"]])
    if (is.na(coicop) || coicop == "NA") coicop <- ""
    coicop <- trimws(gsub("^'+", "", coicop))
    
    name_de <- trimws(as.character(df_row[["Position_D"]]))
    name_fr <- trimws(as.character(df_row[["Position_F"]]))
    name_it <- trimws(as.character(df_row[["Posizione_I"]]))
    name_en <- trimws(as.character(df_row[["Item_E"]]))
    
    if (is.na(name_fr) || nchar(name_fr) == 0) name_fr <- name_de
    if (is.na(name_it) || nchar(name_it) == 0) name_it <- name_de
    if (is.na(name_en) || nchar(name_en) == 0) name_en <- name_de
    
    weight_val <- suppressWarnings(as.numeric(df_row[[weight_col_name]]))
    if (is.na(weight_val)) weight_val <- 0
    
    idx_series <- clean_num_vector(idx_mat[row_idx, ])
    yoy_series <- clean_num_vector(var12_mat[row_idx, ])
    mom_series <- clean_num_vector(var1_mat[row_idx, ])
    
    latest_idx_val <- idx_series[last_valid_idx]
    latest_yoy_val <- yoy_series[last_valid_idx]
    latest_mom_val <- mom_series[last_valid_idx]
    
    prev_idx_val <- if (last_valid_idx > 1) idx_series[last_valid_idx - 1] else NA_real_
    prev_yoy_val <- if (last_valid_idx > 1) yoy_series[last_valid_idx - 1] else NA_real_
    prev_mom_val <- if (last_valid_idx > 1) mom_series[last_valid_idx - 1] else NA_real_
    
    # 1. MoM-Beitrag aus CONTR_m
    contr_mom_val <- 0
    if (!is.null(contr_df) && length(contr_date_cols) > 0) {
      c_match <- which(contr_df[["Code"]] == code)
      if (length(c_match) > 0) {
        last_c_col <- tail(contr_date_cols, 1)
        raw_c <- suppressWarnings(as.numeric(contr_df[c_match[1], last_c_col]))
        if (!is.na(raw_c)) contr_mom_val <- round(raw_c, 3)
      }
    }

    # 2. YoY-Beitrag berechnen (additiv geschlossen über Gewicht und Zuwachs)
    contr_yoy_val <- 0
    contr_yoy_prev_val <- 0
    delta_contr_yoy_val <- 0

    if (!is.na(I_tot_t12) && I_tot_t12 > 0 && weight_val > 0) {
      I_i_t <- latest_idx_val
      I_i_t12 <- if (last_valid_idx > 12) idx_series[last_valid_idx - 12] else NA_real_
      
      if (!is.na(I_i_t) && !is.na(I_i_t12)) {
        # Analytischer Laspeyres-Beitrag: c_i = (w_i/100) * (I_{i,t} - I_{i,t-12}) / I_{tot,t-12} * 100
        # In Prozentpunkten
        c_raw_t <- (weight_val / 100) * (I_i_t - I_i_t12) / I_tot_t12 * 100
        contr_yoy_val <- round(c_raw_t, 3)
      }

      # Vormonat t-1
      if (!is.na(I_tot_prev12) && I_tot_prev12 > 0 && prev_idx >= 1) {
        I_i_prev <- prev_idx_val
        I_i_prev12 <- if (prev_idx > 12) idx_series[prev_idx - 12] else NA_real_

        if (!is.na(I_i_prev) && !is.na(I_i_prev12)) {
          c_raw_prev <- (weight_val / 100) * (I_i_prev - I_i_prev12) / I_tot_prev12 * 100
          contr_yoy_prev_val <- round(c_raw_prev, 3)
          delta_contr_yoy_val <- round(contr_yoy_val - contr_yoy_prev_val, 3)
        }
      }
    }
    
    list(
      code = code,
      bfs_code = code,
      pos_no = if (is.na(pos_no)) NULL else pos_no,
      pos_type = if (is.na(pos_type)) NULL else pos_type,
      level = if (is.na(lvl)) NULL else lvl,
      coicop = coicop,
      parent = if (is.na(parent_code)) NULL else parent_code,
      children = if (length(children) > 0) I(as.character(children)) else list(),
      group_type = group_type,
      names = list(
        de = name_de,
        fr = name_fr,
        it = name_it,
        en = name_en
      ),
      weight = round(weight_val, 3),
      latest = list(
        index = latest_idx_val,
        yoy = latest_yoy_val,
        mom = latest_mom_val,
        contr = contr_mom_val,           # Kompatibilität
        contr_mom = contr_mom_val,       # MoM-Beitrag
        contr_yoy = contr_yoy_val,       # Berechneter YoY-Beitrag
        contr_yoy_prev = contr_yoy_prev_val,
        delta_contr_yoy = delta_contr_yoy_val, # Delta des YoY-Beitrags zum Vormonat
        prev_index = prev_idx_val,
        prev_yoy = prev_yoy_val,
        prev_mom = prev_mom_val
      ),
      history = list(
        index = idx_series,
        yoy = yoy_series,
        mom = mom_series
      )
    )
  }
  
  # 7. Alle COICOP-Elemente verarbeiten
  items_list <- list()
  for (i in seq_len(nrow(coicop_df))) {
    code <- coicop_df[["Code"]][i]
    p_code <- parents[i]
    ch <- children_map[[code]]
    if (is.null(ch)) ch <- character(0)
    
    item_obj <- build_item_object(
      df_row = coicop_df[i, ],
      row_idx = i,
      parent_code = p_code,
      children = ch,
      group_type = "coicop"
    )
    items_list[[code]] <- item_obj
  }
  
  # 8. Sondergliederungen verarbeiten
  special_categories <- list()
  
  if (nrow(special_df) > 0) {
    for (j in seq_len(nrow(special_df))) {
      row_idx <- special_start_idx + j - 1
      code <- as.character(special_df[["Code"]][j])
      pos_d <- as.character(special_df[["Position_D"]][j])
      
      if (is.na(pos_d) || is.na(code)) next
      if (grepl("^100_", code)) next
      
      g_type <- "special_other"
      if (code %in% c("110_101", "110_111", "110_112", "110_113")) g_type <- "special_goods"
      else if (code %in% c("110_102", "110_116", "110_117")) g_type <- "special_services"
      else if (code %in% c("1819_118", "1819_119")) g_type <- "special_origin"
      else if (code %in% c("1170_103", "1170_302", "1170_101", "1170_102")) g_type <- "special_core"
      else if (code %in% c("170_100", "170_110")) g_type <- "special_admin"
      else if (grepl("^11[23456]_|^160_", code)) g_type <- "special_exclusions"
      
      unique_code <- paste0("sp_", code)
      item_obj <- build_item_object(
        df_row = special_df[j, ],
        row_idx = row_idx,
        parent_code = NA_character_,
        children = character(0),
        group_type = g_type
      )
      item_obj$code <- unique_code
      item_obj$bfs_code <- code
      
      items_list[[unique_code]] <- item_obj
      special_categories[[g_type]] <- c(special_categories[[g_type]], unique_code)
    }
  }
  
  cat(sprintf("[CPI Extractor] Total verarbeitete Positionen: %d\n", length(items_list)))
  
  # 9. Struktur für das Gesamtergebnis (JSON)
  output_data <- list(
    meta = list(
      title = title_de,
      basket_structure = basket_str,
      base = base_str,
      weight_year = weight_col_name,
      latest_date = latest_date,
      start_date = valid_dates[1],
      total_months = length(valid_dates),
      dates = valid_dates,
      languages = c("de", "fr", "it", "en"),
      default_language = "de",
      extracted_at = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ"),
      source_file = basename(xlsx_path),
      file_size_bytes = file.info(xlsx_path)$size
    ),
    special_groups = special_categories,
    items = items_list
  )
  
  # 10. Speichern als cpi_data.json
  if (!dir.exists(output_dir)) dir.create(output_dir, recursive = TRUE)
  
  json_file <- file.path(output_dir, "cpi_data.json")
  cat(sprintf("[CPI Extractor] Schreibe JSON nach: %s ...\n", json_file))
  write_json(output_data, json_file, auto_unbox = TRUE, digits = 3, pretty = FALSE)
  
  # 11. Erstelle kompakte summary-Datei
  key_chart_codes <- c(
    "100_100",
    "sp_1170_103", "sp_1170_302",
    "sp_1819_118", "sp_1819_119",
    "sp_110_101", "sp_110_102",
    paste0("100_", 1:13)
  )
  
  summary_items <- list()
  for (k in names(items_list)) {
    it <- items_list[[k]]
    has_history <- k %in% key_chart_codes
    summary_items[[k]] <- list(
      code = it$code,
      bfs_code = it$bfs_code,
      pos_no = it$pos_no,
      pos_type = it$pos_type,
      level = it$level,
      coicop = it$coicop,
      parent = it$parent,
      children = it$children,
      group_type = it$group_type,
      names = it$names,
      weight = it$weight,
      latest = it$latest,
      history = if (has_history) it$history else NULL
    )
  }
  
  summary_data <- list(
    meta = output_data$meta,
    special_groups = output_data$special_groups,
    items = summary_items
  )
  
  summary_file <- file.path(output_dir, "cpi_summary.json")
  cat(sprintf("[CPI Extractor] Schreibe Summary-JSON nach: %s ...\n", summary_file))
  write_json(summary_data, summary_file, auto_unbox = TRUE, digits = 3, pretty = FALSE)
  
  duration <- round(difftime(Sys.time(), t0, units = "secs"), 2)
  cat(sprintf("[CPI Extractor] Erfolgreich abgeschlossen in %s Sekunden!\n", duration))
  cat(sprintf("[CPI Extractor] cpi_data.json: %0.1f MB | cpi_summary.json: %0.1f KB\n",
              file.info(json_file)$size / (1024 * 1024),
              file.info(summary_file)$size / 1024))
  
  invisible(output_data)
}

# Standalone-Ausführung per CLI
if (!interactive() && identical(environment(), globalenv())) {
  args <- commandArgs(trailingOnly = TRUE)
  target_file <- if (length(args) > 0) args[1] else {
    xlsx_files <- list.files(".", pattern = "\\.xlsx$", full.names = TRUE)
    if (length(xlsx_files) == 0) stop("Keine .xlsx Datei im aktuellen Verzeichnis gefunden.")
    xlsx_files[1]
  }
  extract_cpi_file(target_file)
}
