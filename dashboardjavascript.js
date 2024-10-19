const togglebutton=document.getElementById('toggle-btn')
const sidebar=document.getElementById('sidebar')
const togglebuttonnav=document.getElementById('toggle-btn2')
const navlist=document.getElementById('mobilelist')
const videoSources = {
    clear: 'clearsky.mp4',
    clouds: 'cloudy.mp4',
    rain: 'rain.mp4',
    thunder:'thunder.mp4',
    snow: 'snow.mp4',
    sunny:'sunny.mp4',
};

let myChart;
let myDoughnutChart;
let myLineChart;

const APIKey='42a8f29170c4ce1593ce0bffe6bd20fc';

let searchedcity="";
let units="metric";
let city=document.querySelector('.city');
let datetime=document.querySelector('.datetime');
let description=document.querySelector('.description');
let temp=document.querySelector('.temperature');
let icon=document.querySelector('.weathericon');
let minmax=document.querySelector('.minmax');
let humidity=document.querySelector('.humidity');
let wind=document.querySelector('.wind');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

document.querySelector('.fahrenheit').addEventListener('click',e=>{
    if(units=="metric")
    {
        document.querySelector('.fahrenheit').classList.toggle('active');
        document.querySelector('.celsius').classList.toggle('active');
        units="imperial";
        getweather();
    }
})

document.querySelector('.celsius').addEventListener('click',e=>{
    if(units=="imperial")
    {
        document.querySelector('.fahrenheit').classList.toggle('active');
        document.querySelector('.celsius').classList.toggle('active');
        units="metric";
        getweather();
    }
})

document.querySelector('.search').addEventListener('submit',e=>{
    e.preventDefault();
    let search=document.querySelector('.searchinput').value.trim();
    const showMessage = (message) => {
        document.getElementById('weather').innerHTML = `<p>${message}</p>`;
        setTimeout(() => {
            document.getElementById('weather').innerHTML = '';
        }, 3000);
    };
    if(search)
    {
        if(search.toLowerCase() !== searchedcity.toLowerCase())
        {
            searchedcity=search;
            getweather();
        }
        else
        {
            showMessage("Country Already Shown");
        }
    }
    else
    {
        showMessage("Please Enter Something To Search");
    }
})

function convertingtime(timestamp,zone)
{
    const convtime=zone/3600;
    const date=new Date(timestamp*1000);
    const options=
    {
        weekday:"long",
        day:"numeric",
        month:"long",
        year:"numeric",
        hour:"numeric",
        minute:"numeric",
        timeZone:`Etc/GMT${convtime>=0?"-":"+"}${Math.abs(convtime)}`,
        hour12:true,
    }
    return date.toLocaleString("en-US",options);
}

function togglesidebar(){
    sidebar.classList.toggle('close')
    togglebutton.classList.toggle('rotate')
}

function togglenavbar(){
    navlist.classList.toggle('close')
    togglebuttonnav.classList.toggle('rotate')
}

function getweather()
{
    showSpinner();
    sleep(2000);
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchedcity}&appid=${APIKey}&units=${units}`).then(res=>res.json()).then
    (data=>{
        const showMessage = (message) => {
            document.getElementById('weather').innerHTML = `<p>${message}</p>`;
            setTimeout(() => {
                document.getElementById('weather').innerHTML = '';
            }, 3000);
        };
        if (data.cod !== 200) {
            showMessage(data.message);
            hideSpinner();
            return;
        }
        const weatherCondition = `${data.weather[0].main.toLowerCase()}`;
        changeVideo(weatherCondition);
        city.innerHTML=`${data.name},${data.sys.country}`
        datetime.innerHTML=convertingtime(data.dt,data.timezone);
        description.innerHTML=`<p>${data.weather[0].main}</p>`
        temp.innerHTML=`${data.main.temp.toFixed()}&#176`
        icon.innerHTML=`<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png"> `
        minmax.innerHTML=`<p>Min: ${data.main.temp_min.toFixed()}&#176</p><p>Max: ${data.main.temp_max.toFixed()}&#176</p>`
        humidity.innerHTML=`${data.main.humidity}%`
        wind.innerHTML=`${data.wind.speed} m/s`
        hideSpinner();
        fivedayscharts();
    })
    .catch(error => {
        console.error("Error fetching the weather data:", error);
        document.getElementById('weather').innerHTML = `<p>Unable to fetch weather data.</p>`;
    });
}

function getWeatherData(latitude, longitude) 
{
    showSpinner();
    sleep(2000);
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${APIKey}`)
        .then(response => response.json())
        .then(data => {
            const showMessage = (message) => {
                document.getElementById('weather').innerHTML = `<p>${message}</p>`;
                setTimeout(() => {
                    document.getElementById('weather').innerHTML = '';
                }, 3000);
            };
            if (data.cod !== 200) {
                showMessage(data.message);
                hideSpinner();
                return;
            }
            const weatherCondition = `${data.weather[0].main.toLowerCase()}`;
            changeVideo(weatherCondition);
            searchedcity=`${data.name}`;
            city.innerHTML=`${data.name},${data.sys.country}`
            datetime.innerHTML=convertingtime(data.dt,data.timezone);
            description.innerHTML=`<p>${data.weather[0].main}</p>`
            temp.innerHTML=`${data.main.temp.toFixed()}&#176`
            icon.innerHTML=`<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png"> `
            minmax.innerHTML=`<p>Min: ${data.main.temp_min.toFixed()}&#176</p><p>Max: ${data.main.temp_max.toFixed()}&#176</p>`
            humidity.innerHTML=`${data.main.humidity}%`
            wind.innerHTML=`${data.wind.speed} m/s`
            hideSpinner();
            fivedayscharts();
        })
        .catch(error => {
            console.error("Error fetching the weather data:", error);
            document.getElementById('weather').innerHTML = `<p>Unable to fetch weather data.</p>`;
        });
}

function fivedayscharts()
{
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchedcity}&appid=${APIKey}&units=${units}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const fiveDayData = [];
        const forecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
        forecasts.forEach(forecast => 
            {
            const day = new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'long' });
            const temperature = forecast.main.temp.toFixed();
            const weatherCondition = forecast.weather[0].description;
            fiveDayData.push
            ({
              day: day,
              temperature: temperature,
              forecast: weatherCondition
            });
          });
          createChart(fiveDayData);
          createDoughnutChart(fiveDayData);
          createLineChart(fiveDayData);
    })
    .catch(error => {
        console.error("Error fetching the weather data:", error);
        document.getElementById('weather').innerHTML = `<p>Unable to fetch 5 days weather data.</p>`;
    });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                getWeatherData(latitude, longitude);
            },
            (error) => {
                console.error("Error getting location:", error);
                document.getElementById('weather').innerHTML = `<p>Unable to retrieve location.</p>`;
            }
        );
    } else {
        document.getElementById('weather').innerHTML = `<p>Geolocation is not supported by your browser.</p>`;
    }
}

window.addEventListener('load',getLocation())

function changeVideo(con) {
    const videoElement = document.getElementById('background-video');
    const videoSource = videoSources[con] || videoSources.clear;

    videoElement.setAttribute('src',videoSource);
    videoElement.setAttribute('type','video/mp4');
    videoElement.load();
}

function createChart(fiveDayData) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (myChart) {
        myChart.destroy();
    }
    const labels = fiveDayData.map(item => item.day);
    const temperatures = fiveDayData.map(item => item.temperature);
    let fontsize=window.innerWidth<800? 14:19;
    let titlesize=window.innerWidth<800? 14:24;
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'grey',
                borderColor: 'grey',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: fontsize,
                        },
                    },
                },
                title: {
                    display: true,
                    text: '5-Day Weather Forecast',
                    color: '#ffffff',
                    font: {
                        family: 'Poppins',
                        size: titlesize,
                        weight: 'bold',
                    }
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: fontsize,
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: fontsize-8,
                        }
                    }
                }
            },
            elements: {
                bar: {
                    backgroundColor: '#171717',
                }
            },
            backgroundColor: '#1e1e1e',
            animation: {
                onComplete: () => {},
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !context.dropped) {
                        delay = context.dataIndex * 300 + context.datasetIndex * 100;
                        context.dropped = true;
                    }
                    return delay;
                }
            }
        }
    });
}

function createDoughnutChart(fiveDayData) {
    const ctx = document.getElementById('myDoughnutChart').getContext('2d');

    const weatherCounts = fiveDayData.reduce((acc, item) => {
        acc[item.forecast] = (acc[item.forecast] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(weatherCounts);
    const data = Object.values(weatherCounts);
    let fontsize=window.innerWidth<800? 12:18;
    let titlesize=window.innerWidth<800? 14:24;
    if (myDoughnutChart) {
        myDoughnutChart.destroy();
    }
    myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weather Conditions',
                data: data,
                backgroundColor: [
                    'rgba(58, 81, 130, 0.98)',
                    'rgba(197, 197, 197, 0.5)',
                    'rgba(114, 114, 114, 0.5)',
                    'rgba(255, 255, 255, 0.5)',
                    'rgba(22, 4, 59, 0.5)'
                ],
                borderColor: 'transparent',
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size:fontsize,
                        },
                    },
                },
                title: {
                    display: true,
                    text: ['Weather Condition', 'Distribution Over 5 Days'],
                    color: '#ffffff',
                    font: {
                        family: 'Poppins',
                        size: titlesize,
                        weight: 'bold',
                    },
                    padding: {
                        top: 10,
                        bottom: 10,
                    },
                },
            },
            animation: {
                onComplete: () => {},
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !context.dropped) {
                        delay = context.dataIndex * 400;
                        context.dropped = true;
                    }
                    return delay;
                }
            }
        }
    });
}

function createLineChart(fiveDayData) {
    const ctx = document.getElementById('myLineChart').getContext('2d');

    const temperatures = fiveDayData.map(item => item.temperature);
    const labels = fiveDayData.map(item => item.day);

    if (myLineChart) {
        myLineChart.destroy();
    }
    let fontsize=window.innerWidth<800? 12:18;
    let titlesize=window.innerWidth<800? 13:24;
    myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'grey',
                borderColor: 'grey',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size:fontsize,
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Temperature Changes Over 5 Days',
                    color: '#ffffff',
                    font: {
                        family: 'Poppins',
                        size: titlesize,
                        weight: 'bold',
                    }
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size:fontsize,
                        },
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)',
                        
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size:fontsize-6,
                        },
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)',
                    }
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            animation: {
                x: {
                    easing: 'easeOutBack',
                    from: 100,
                    duration: 1500
                },
                y: {
                    easing: 'easeInBounce',
                    from: -200,
                    duration: 1500
                }
            }
        }
    });
}

document.querySelector('#tablelink').addEventListener('click',function(){
    localStorage.setItem('searchedCity', searchedcity);
    window.location.href = 'tables.html';
})