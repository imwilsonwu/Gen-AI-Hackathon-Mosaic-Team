from flask import Flask, json, request
from route_gen_algorithm import generate_routes
from openai import AzureOpenAI
from flask_cors import CORS

companies = [{"id": 1, "name": "Company One"}, {"id": 2, "name": "Company Two"}]

api = Flask(__name__)
CORS(api)

# gets the API Key from environment variable AZURE_OPENAI_API_KEY
client = AzureOpenAI(
    api_key="", 
    api_version="2024-06-01",
    azure_endpoint="https://hkust.azure-api.net",
)

@api.route('/companies', methods=['GET'])
def get_companies():
  return json.dumps(companies)

@api.route('/routegenerator', methods=['POST'])
def parse_request():
    data = request.json
    start = data['from']
    goal = data['to']
    user_id = data['user_id']
    weights1 = data['weights']
    print(weights1)
    weights2 = [5, 1, 0, 1, 1, 0, 2, 0, 1, 0, 0, 1, 1] # should be fetched using user id instead
    return json.dumps(generate_routes(start, goal, weights1, weights2))

@api.route('/chatbot', methods=['POST'])
def parse_chatbot_request():
    data = request.json
    response = client.chat.completions.create(
    	model="gpt-4o-mini",  # e.g. gpt-35-instant
    	messages=data
    )
    return json.dumps(response.to_dict())

if __name__ == '__main__':
    api.run(host="0.0.0.0", port=5000)