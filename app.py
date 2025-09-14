import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json

# Initialize Flask App
# The static_folder points to the directory where the React build output is.
# The static_url_path='' means that files can be accessed from the root URL.
app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# --- API Routes ---

@app.route('/api/physiotherapists', methods=['GET'])
def get_physiotherapists():
    """
    Endpoint to get the list of all physiotherapists.
    Reads data from the physiotherapists.json file.
    """
    try:
        # The file is now in the same directory as the script.
        with open('physiotherapists.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "Physiotherapists data file not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot_response():
    """
    Endpoint for the chatbot.
    Accepts a user message and returns a mock response.
    """
    if not request.json or 'message' not in request.json:
        return jsonify({"error": "Request must be JSON and contain a 'message' key."}), 400

    user_message = request.json['message']

    # Mock response logic
    response_message = f"This is a mock response to your message: '{user_message}'. Online functionality is not yet implemented."

    return jsonify({
        "reply": response_message,
        "source": "mock_backend"
    })

# --- Frontend Serving Routes ---

@app.route('/')
def serve_index():
    """Serves the main index.html file."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serves other static files like JS, CSS, images."""
    return send_from_directory(app.static_folder, path)


# --- Main Execution ---

if __name__ == '__main__':
    app.run(debug=True, port=5000)
