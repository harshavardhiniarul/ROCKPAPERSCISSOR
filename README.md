#  Rock Paper Scissors

A Flask-based multiplayer rock-paper-scissors game that uses a trained Keras image classifier to recognize hand gestures from webcam input. Each player locks in a move, and the server predicts whether they played rock, paper, or scissors before revealing the round result.

## Overview

This project combines:

- Flask for the web app and API
- TensorFlow/Keras for gesture classification
- PIL and NumPy for image preprocessing
- JavaScript and browser camera access for live gameplay

The app lets two players enter their names, allow camera access, and play a best-of-series match with hand gestures instead of manual button clicks.

## Features

- Two-player name entry screen
- Webcam-based move capture for each player
- AI prediction for rock, paper, and scissors gestures
- Round-by-round scoring and draw handling
- Best-of-series gameplay flow
- Responsive game UI with live status updates
- Secure image prediction endpoint for classroom or demo environments

## Tech Stack

- Python 3.x
- Flask
- TensorFlow / Keras
- Pillow
- NumPy
- HTML, CSS, JavaScript

## Project Structure

```text
rock-paper-scissors-flask/
├── app.py                  # Flask application and prediction logic
├── keras_model.h5         # Pretrained gesture recognition model
├── labels.txt             # Class labels for the model output
├── requirements.txt       # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css      # Application styling
│   └── js/
│       └── camera.js      # Webcam capture and game logic
├── templates/
│   ├── game.html          # Main game UI
│   └── index.html         # Player registration page
└── README.md              # Project documentation
```

## Prerequisites

Before running the app, make sure you have:

- Python 3.9 or later
- A webcam or compatible camera device
- A virtual environment tool such as `venv`
- Access to install Python packages

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd rock-paper-scissors-flask
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
```

On Windows:

```powershell
venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install flask tensorflow pillow numpy
```

> If your environment requires a different TensorFlow build, install the version compatible with your system and Python version.

4. Make sure the model files exist in the project root:

- `keras_model.h5`
- `labels.txt`

## Running the App

Start the Flask server:

```bash
python app.py
```

Then open the app in your browser:

```text
http://localhost:5000
```

## How It Works

1. The user enters two player names on the landing page.
2. Each player is shown a live webcam preview.
3. When a player clicks the lock-in button, the app captures a frame.
4. The frame is resized, normalized, and sent to the `/predict` endpoint.
5. The trained model classifies the image as one of the labels.
6. The predicted move is normalized to `rock`, `paper`, or `scissors`.
7. The round outcome is determined and points are scored.

## Prediction Endpoint

The app exposes a POST endpoint at `/predict`.

### Request

- Form-data field: `image`

### Response

```json
{
  "prediction": "rock",
  "confidence": 96.43
}
```

## Model Notes

The model file `keras_model.h5` is expected to be trained on hand gesture classes corresponding to the labels in `labels.txt`.

Typical labels are:

```text
rock
paper
scissors
```

If the model or labels do not match your training data, the prediction results may be inaccurate.

## Camera Permissions

The browser asks for camera access when the game loads. If permissions are denied or the camera is unavailable, the app displays a warning and the player cannot complete a move until the device is accessible.

## Troubleshooting

### ModuleNotFoundError

If Python cannot find dependencies, reinstall them in the active virtual environment:

```bash
pip install -r requirements.txt
```

If `requirements.txt` is empty in your environment, install the packages manually as shown in the installation step.

### Model loading errors

Check that:

- `keras_model.h5` exists in the project root
- You are using a compatible TensorFlow/Keras version
- The file was not renamed or moved

### Camera not working

- Ensure browser permissions are allowed
- Use localhost or a local web server instead of a file URL
- Confirm your device is connected and not already in use by another app

## License

This project is intended for educational and demonstration purposes. Add an appropriate license if you plan to distribute it publicly.

## Contributing

Pull requests, improvements, and model refinements are welcome. If you enhance the recognition accuracy or add a leaderboard, feel free to open a contribution.

## Authors

This project is a lightweight Flask + machine learning demo for AI-powered hand gesture gameplay.
