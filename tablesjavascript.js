const togglebutton=document.getElementById('toggle-btn')
const sidebar=document.getElementById('sidebar')
const togglebuttonnav=document.getElementById('toggle-btn2')
const navlist=document.getElementById('mobilelist')

const APIKey='42a8f29170c4ce1593ce0bffe6bd20fc';

let fiveDayData = [];
let filtered5dayData=[];
let index=0;
let pagenum=1;
let searchedcity="Islamabad";
let units="metric";

document.querySelector('#prev').addEventListener('click',e=>{
    if(index==0)
    {

    }
    else
    {
        pagenum--;
        document.querySelector('#pagenum').innerHTML="Page "+pagenum;
        index-=10;
        fivedaystable();
    }
})

document.querySelector('#next').addEventListener('click',e=>{
    if(index+10 >=filtered5dayData.length)
    {

    }
    else
    {
        pagenum++;
        document.querySelector('#pagenum').innerHTML="Page "+pagenum;
        index+=10;
        fivedaystable();
    }
})

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
        fiveDayData = [];
        getfivedaysdata();
    }
})

document.querySelector('.celsius').addEventListener('click',e=>{
    if(units=="imperial")
    {
        document.querySelector('.fahrenheit').classList.toggle('active');
        document.querySelector('.celsius').classList.toggle('active');
        units="metric";
        fiveDayData = [];
        getfivedaysdata();
    }
})

function togglesidebar(){
    sidebar.classList.toggle('close')
    togglebutton.classList.toggle('rotate')
}

function togglenavbar(){
    navlist.classList.toggle('close')
    togglebuttonnav.classList.toggle('rotate')
}

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
            fiveDayData = [];
            getfivedaysdata();
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

function getfivedaysdata()
{
    showSpinner();
    sleep(2000);
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchedcity}&appid=${APIKey}&units=${units}`)
    .then(response => response.json())
    .then(data => {
        const forecasts = data.list.filter(item => item.dt_txt);
        forecasts.forEach(forecast => 
            {
            const dateTime = new Date(forecast.dt_txt);
            const day = dateTime.toLocaleDateString('en-US', { weekday: 'long' });
            const time=dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temperature = forecast.main.temp.toFixed();
            const weathericon=forecast.weather[0].icon;
            const weatherCondition = forecast.weather[0].description;
            const humidity=forecast.main.humidity;
            const wind=forecast.wind.speed;
            fiveDayData.push
            ({
                day: day,
                time:time,
                temperature: temperature,
                Icon: weathericon,
                forecast: weatherCondition,
                humidity: humidity,
                wind: wind
            });
          });
          checkfilter(document.querySelector('#filter').value);
          hideSpinner();
    })
    .catch(error => {
        console.error("Error fetching the weather data:", error);
        document.getElementById('weather').innerHTML = `<p>Unable to fetch 5 days weather data.</p>`;
    });
}

function getcity(latitude, longitude) 
{
    showSpinner();
    sleep(3000);
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
            searchedcity=`${data.name}`;
            getfivedaysdata();
            hideSpinner();
        })
        .catch(error => {
            console.error("Error fetching the weather data:", error);
            document.getElementById('weather').innerHTML = `<p>Unable to fetch weather data.</p>`;
        });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                getcity(latitude, longitude);
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

function fivedaystable()
{
    const forecastTable = document.querySelector('.forcasttable table');
    forecastTable.innerHTML = '';
    document.querySelector('.city').innerHTML=searchedcity;
    if(document.querySelector('#filter').value=='all')
    {
        filtered5dayData=fiveDayData;
    }
    const todisplay = filtered5dayData.slice(index, index + 10);
    if (todisplay.length === 0) {
        const emptyRow = `
            <tr>
                <td class="error" colspan="4">No data available for the selected filter.</td>
            </tr>
        `;
        forecastTable.innerHTML = emptyRow;
        return;
    }
    todisplay.forEach((day, index) => {
        const forecastRow = `
            <tr>
                <td class="date">${day.day}</td>
                <td class="time">${day.time}
                <td class="weathericon">
                    <img src="http://openweathermap.org/img/wn/${day.Icon}@2x.png" alt="${day.forecast}">${day.temperature}&#176
                </td>
                <td>
                    <div class="col3hum">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                            <path d="M580-240q25 0 42.5-17.5T640-300q0-25-17.5-42.5T580-360q-25 0-42.5 17.5T520-300q0 25 17.5 42.5T580-240Z"/>
                        </svg>
                        <div>
                            <p class="humidity">${day.humidity}%</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="col4wind">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                            <path d="M460-160q-50 0-85-35t-35-85h80q0 17 11.5 28.5T460-240q17 0 28.5-11.5T500-280q0-17-11.5-28.5T460-320H80v-80h380q50 0 85 35t35 85q0 50-35 85t-85 35Z"/>
                        </svg>
                        <div>
                            <p class="wind">${day.wind} m/s</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        forecastTable.innerHTML += forecastRow;
    });
}

document.querySelector('#filter').addEventListener('change',e=>{
    checkfilter(e.target.value);
});

function checkfilter(filterselected)
{
    switch(filterselected)
    {
        case 'asc':
            filtered5dayData=[...fiveDayData].sort((a,b)=>a.temperature-b.temperature);
            break;
        case 'dsc': 
            filtered5dayData=[...fiveDayData].sort((a,b)=>b.temperature-a.temperature);
            break;
        case 'rain':
            filtered5dayData = fiveDayData.filter(day => day.forecast.toLowerCase().includes('rain'));
            break;
        case 'max':
            const maxtemp=Math.max(...fiveDayData.map(day=>day.temperature));
            filtered5dayData=fiveDayData.filter(day=>day.temperature==maxtemp);
            break;
        default:
            filtered5dayData=fiveDayData;
    }
    fivedaystable();
}

window.onload = function() {
    const searchedCity = localStorage.getItem('searchedCity');
    searchedcity=searchedCity;
    getfivedaysdata();
};

document.getElementById('next').addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.querySelector('.helpbutton').addEventListener('click',function(){
    document.querySelector('.rightbox').classList.toggle('active');
    document.querySelector('.closebutton').classList.toggle('active');
})

document.querySelector('.closebutton').addEventListener('click',function(){
    document.querySelector('.rightbox').classList.toggle('active');
    document.querySelector('.closebutton').classList.toggle('active');
})