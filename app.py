import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"

from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import DepthwiseConv2D
from PIL import Image
import numpy as np

app = Flask(__name__)


class LegacyDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        kwargs.pop("groups", None)
        super().__init__(*args, **kwargs)


model = load_model(
    "keras_model.h5",
    custom_objects={"DepthwiseConv2D": LegacyDepthwiseConv2D},
    compile=False
)

labels = []

with open("labels.txt", "r") as file:
    labels = [line.strip().split(maxsplit=1)[-1].lower() for line in file if line.strip()]


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/start", methods=["POST"])
def start_game():
    player1 = request.form.get("player1")
    player2 = request.form.get("player2")

    return render_template(
        "game.html",
        player1=player1,
        player2=player2
    )

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "No image received"}), 400

    image_file = request.files["image"]

    image = Image.open(image_file).convert("RGB")

    input_shape = model.input_shape
    height = input_shape[1]
    width = input_shape[2]

    image = image.resize((width, height))

    image_array = np.asarray(image).astype(np.float32)

    image_array = (image_array / 127.5) - 1

    image_array = np.expand_dims(image_array, axis=0)

    prediction = model.predict(image_array, verbose=0)

    index = np.argmax(prediction)

    confidence = float(prediction[0][index]) * 100

    return jsonify({
        "prediction": labels[index],
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)