# Gen-AI-Hackathon-Mosaic-Team

## Team Member
Zhi-yu Zhang 

Ming-Hua Wu 

Qian Yu  

Yu-ke Cai 

Tsz-Yu Lin

from HKU, HKUST

# Folder Description

## web-frontend

"web-frontend" folder contains the code for the frontend of the main application. It is created based on React.js. 

Generally, it contains a chatbot and a map (route) display module. 
- When user communicate with the chatbot, it will send request to the backend api (introduced below) in order to forward the user's message to Gen AI API and get response.
- When user click "Generate route" button, it will send the route indicators to the Gen AI API, and ask the Gen AI to evaluate according to the conversation above.
- After receiving the route indicator weights (values) from the GenAI, it will send request to the backend api (again) in order to generate a route.
- After receiving the routes, the routes will be shown to the user.   

## api

"api" folder contains the code for the backend of the main application. It is created based on Python, Scikit Learn and Flask. It serve as two purposes
- It serves as a proxy that forward user's message to GenAI API. Here, we are using the api provided by HKUST ITSC, which is based on Azure OpenAI.
- It serves as the route recommendation module. The route recommenation module will execute the A Star algorithm to find the optimized routes. The code is written in a seperate file (/api/route_gen_algorithm.py). The route recommendation module will also utilize the data produced by the needs mining module (introduced below) to generate a better and more personalized routes. 

## needs-mining-module

"needs-mining-module" folder contains the code for needs mining module. It is also created based on Python. It will perform clustering by using user data and discover the commmon needs of people in the same group. 
