# WeatherApp

#READ ME#

# HOW TO RUN # 

1. Extract The Main Folder Named "WeatherApp".
2. Open Visual Studio Code.
3. Click "File" and select "Open Folder".
4. Navigate and find the folder that you just extracted.
5. Once the project is loaded into vs code, on the explorer left side, navigate to html/dashboard.html.
6. Right click on it and press Open With Live Server.
7. The project would start running on a browser.

# PROJECT EXPLAINATION # 

#Dashboard# 

Side-menu containing links to dashboard page and tables page with a logo icon on the top. There is a main weather widget which displayed all the information, upon loading gets your latitude and longitude positions using geolocation and then fetches the weather data from the open weather api and displays it dynamically. It also runs a video on the side of the widget on the bases of the weather description. Below it are 3 charts containing the delay and drop animations. This website is responsive for smaller screens as-well. You have a Celsius and Fahrenheit switch which displays all the charts and weather details in the selected one. You have a search bar on the top which you can enter a city in and press the get weather button and if the city exists and the api fetch call works, it would display the weather of the city dynamically otherwise it would display the error.

#Tables# 

Same side-menu from dashboard page, same search and get weather button also displaying any errors that might occur. Then there is a table on the left which displays the weather of each 5 days and 3 hrs daily into a table and you have pagination at the bottom from which you can change pages of the table to display the next 10 values. On the right you have a chatbot which can help answer your queries related to weather of any city. This page is responsive as-well.
