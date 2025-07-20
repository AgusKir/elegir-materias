# Patear Frontend

## Overview
Patear is a web application designed to help students manage their course enrollment based on completed subjects and available courses. The application provides an intuitive interface for selecting completed subjects, choosing the number of subjects to enroll in, and selecting the semester.

## Project Structure
```
patear-frontend
├── src
│   ├── app.py                # Main entry point for the application
│   ├── patear.py             # Core logic for managing subjects and calculations
│   └── templates
│       └── index.html        # HTML template for the front-end interface
│   └── static
│       └── main.js           # JavaScript for handling user interactions
├── requirements.txt          # List of dependencies
└── README.md                 # Project documentation
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd patear-frontend
   ```

2. **Install dependencies**:
   It is recommended to use a virtual environment. You can create one using:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
   Then install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. **Run the application**:
   Start the Flask server by running:
   ```
   python src/app.py
   ```
   The application will be accessible at `http://127.0.0.1:5000`.

## Usage
- Open your web browser and navigate to the application URL.
- Use the checklist to select the subjects you have completed.
- Choose the number of subjects you wish to enroll in from the dropdown (1 to 9).
- Select the semester (1 or 2) from the dropdown.
- Click the "Calculate" button to see the available courses for the next semester based on your selections.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.