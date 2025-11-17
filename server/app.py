import os
import json
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import traceback

# --- FIXED ---
# Import the correct function 'run_and_save_solver' from 'timetable_solver'
from timetable_solver import run_and_save_solver

app = Flask(__name__)
# Enable CORS to allow your React app
CORS(app)

# Create folders for uploads and outputs
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER


# --- MODIFIED FUNCTION ---
def convert_excel_to_json(filepath):
    """
    Reads a multi-sheet Excel file, cleans/formats it,
    and converts each sheet into the JSON format the React app expects.
    """
    all_timetables_json = {}

    # Define the required order of days
    expected_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    try:
        output_xls = pd.ExcelFile(filepath)

        for sheet_name in output_xls.sheet_names:
            # Read the sheet. Assumes 'Day/Time' is the first column (index 0)
            df = pd.read_excel(output_xls, sheet_name=sheet_name, index_col=0)

            # Skip non-timetable sheets (like the reports)
            # Timetable sheets will have "Day/Time" as their index name
            if df.index.name != "Day/Time":
                continue

            # --- Change 1: Clean Course Names ---
            # Replaces 'Course (sem_branch)-LEC' with 'Course-LEC'
            # This regex finds a space, (any chars), and a hyphen
            df.replace(to_replace=r"\s\(.*\)-", value="-", regex=True, inplace=True)

            # Replace NaN/None and '0' with "" for a cleaner frontend display
            df.fillna("", inplace=True)
            df.replace("0", "", inplace=True)

            # --- Change 2: Add Lunch Column ---
            if "12" in df.columns and "2" in df.columns:
                # Find the position of '12'
                loc = df.columns.get_loc("12") + 1
                # Insert the 'Lunch' column at this position, filled with "Lunch"
                df.insert(loc, "Lunch", "Lunch")

            # Transpose the DataFrame so days become columns
            df_transposed = df.T

            # Set the new index name (which was the columns) to 'Day'
            df_transposed.index.name = "Day"

            # Reset the index so 'Day' becomes a regular column
            df_transposed.reset_index(inplace=True)

            # --- Change 3: Order Days ---
            # Ensure 'Day' column is first, followed by the specified days
            all_cols = ["Day"] + [
                day for day in expected_days if day in df_transposed.columns
            ]
            # Filter df_transposed to only include these columns in this order
            df_transposed = df_transposed[all_cols]

            # Convert to the {column: [values...]} format
            # and add to the main flat dictionary
            all_timetables_json[sheet_name] = df_transposed.to_dict(orient="list")

    except Exception as e:
        print(f"Error converting Excel to JSON: {e}")
        raise

    # Return the flat JSON structure, as the React app expects
    return all_timetables_json


# --- END MODIFIED FUNCTION ---


@app.route("/generate-timetable", methods=["POST"])
def generate_timetable():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(".xlsx"):
        return jsonify({"error": "Invalid file type. Please upload an .xlsx file"}), 400

    filepath = None
    output_filepath = None
    try:
        filename = secure_filename(file.filename)
        # print(filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # Define a unique output file path
        output_filename = f"output_{filename}"
        output_filepath = os.path.join(app.config["OUTPUT_FOLDER"], output_filename)

        print(f"File saved to {filepath}")

        # --- Run Your Solver ---
        # This function runs your original code and saves the result to 'output_filepath'
        run_and_save_solver(filepath, output_filepath)

        print(f"Solver finished, output saved to {output_filepath}")

        # --- Convert Output File to JSON ---
        # This now calls our MODIFIED function
        timetables_json = convert_excel_to_json(output_filepath)

        print("Successfully converted output Excel to JSON.")

        # Return the JSON data
        return jsonify(timetables_json)

    except Exception as e:
        # Catch any errors from your script
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": f"An error occurred during solving: {str(e)}"}), 500
    # finally:
    #     # Clean up both files
    #     if filepath and os.path.exists(filepath):
    #         os.remove(filepath)
    #     if output_filepath and os.path.exists(output_filepath):
    #         os.remove(output_filepath)


if __name__ == "__main__":
    # Run the server on http://127.0.0.1:5000
    app.run(debug=True, port=5000)
