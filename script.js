document.addEventListener('DOMContentLoaded', function () {

    let city = document.querySelector('.city');
    let country = document.querySelector('.country');
    let dateTime = document.querySelector('.date-time');
    let degrees = document.querySelector('.degrees');
    let weatherIcon = document.querySelector('.weather-icon');
    let windSpeed = document.querySelector('.wind-speed');
    let windDirection = document.querySelector('.wind-direction');
    let humidity = document.querySelector('.humidity');
    let pressure = document.querySelector('.pressure');
    let weatherIndicators = document.querySelector('.weather-indicators');
    let futureForecast = document.querySelector('.future-forecast');
    let apiKey = 'c0870153e00bece09ca5362f2a4484ea';
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    function checkZeros (i) {
        if (i < 10) {
            i = `0${i}`;
        }
        return i;
    } 

    /* Clock */
    function setDateTime () {
        let date = new Date();
        dateTime.textContent = `${days[date.getDay()]}  ${date.getDate()}  ${months[date.getMonth()]}  ${checkZeros(date.getHours())}:${checkZeros(date.getMinutes())}:${checkZeros(date.getSeconds())}`;
    }
    setInterval(setDateTime, 1000);

    /* User coordinates */
    let promise = new Promise(function (resolve, reject){
        navigator.geolocation.getCurrentPosition(function(position) {
            resolve(position);
        }, 
        function() {
            reject('Нет доступа к координатам');
        });
    })

    /* Todays weather */
    promise.then(
        position => {
            return new Promise(function(resolve){
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
                .then(
                    response => resolve(response.json())
                )
            })
        },
        error => {
            console.log(error)
        }
    )
    .then(
        result => {
            console.log(result);
            city.textContent = `${result.name},`;
            country.textContent = `${result.sys.country}`;
            degrees.textContent = `${result.main.temp - 273.15}`;
            weatherIcon.setAttribute('src', `http://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png`);
            windSpeed.textContent = `WIND: ${result.wind.speed} m/s`;
            windDirection.textContent = `DIRECTION: ${setupWindDirection(result)}`;
            humidity.textContent = `HUMIDITY: ${result.main.humidity}%`;
            pressure.textContent = `PRESSURE: ${result.main.pressure} mm Hg`;
            result.weather.forEach(function (item) {
                let weather = document.createElement('div');
                weather.classList.add('weather');
                weatherIndicators.append(weather);
                weather.textContent = `${item.main}`;
                })

            function setupWindDirection (obj) {
                if (obj.wind.deg >=0 && obj.wind.deg < 22) {
                    return 'N';
                }
                if (obj.wind.deg >=22 && obj.wind.deg < 67) {
                     return 'N-E';
                }
                if (obj.wind.deg >=67 && obj.wind.deg < 112) {
                    return 'E';
                }
                if (obj.wind.deg >=112 && obj.wind.deg < 157) {
                    return 'S-E';
                }
                if (obj.wind.deg >=157 && obj.wind.deg < 202) {
                     return 'S';
                }
                if (obj.wind.deg >=202 && obj.wind.deg < 247) {
                    return 'S-W';
                }
                if (obj.wind.deg >=247 && obj.wind.deg < 292) {
                    return 'W';
                }
                if (obj.wind.deg >=292 && obj.wind.deg < 337) {
                    return 'N-W';
                }
                if (obj.wind.deg >=337 && obj.wind.deg <= 360) {
                    return 'N';
                }
            }
        }, 
        error => {
            console.log(error);
        }
    )

    /* Next 4 days weather */
    promise.then(
        position => {
            return new Promise(function (resolve) {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=${apiKey}`)
                .then(
                    response => resolve(response.json())
                )
            })
        },
        error => {
            console.log(error);
        }
    )
    .then(
        result => {
            console.log(result);
            let newDate = new Date();
            let tomorrow = new Date(`${newDate.getFullYear()}`, `${newDate.getMonth()}`, `${newDate.getDate()+1}`);
            let tomorrowTxt = `${tomorrow.getFullYear()}-${checkZeros(tomorrow.getMonth()+1)}-${checkZeros(tomorrow.getDate())}`;
            console.log(tomorrowTxt);
            
            let index;
            for (let i = 0; i < result.list.length; i++) {
                if (result.list[i].dt_txt.indexOf(tomorrowTxt) != -1) {
                    index = i;
                    break;
                }
            }
            console.log(index);
            
            let dayCounter = 1;
            for (j = index + 4; j < result.list.length; j += 8) {
                let futureIndicators = document.createElement('div');
                futureIndicators.classList.add('future-indicators');
                let futureDay = document.createElement('div');
                futureDay.classList.add('future-day');
                let futureTemperature = document.createElement('div');
                futureTemperature.classList.add('future-temperature');
                let futureIcon = document.createElement('img');
                futureIcon.setAttribute('src', `http://openweathermap.org/img/wn/${result.list[j].weather[0].icon}@2x.png`);
                let weekDay = new Date(`${newDate.getFullYear()}`, `${newDate.getMonth()}`, `${newDate.getDate() + dayCounter}`);
                futureDay.textContent = `${days[weekDay.getDay()]}`;
                futureTemperature.textContent = `${Math.round(result.list[j].main.temp - 273.15)}`;
                futureIndicators.append(futureDay, futureTemperature, futureIcon);
                futureForecast.append(futureIndicators);
                dayCounter++;
            }     
        },
        error => {
            console.log(error);
        }
    )

    /* Map */
    promise.then(
        position => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            ymaps.ready(init);
            function init(){
            let myMap = new ymaps.Map("yandex-map", {
            center: [lat, lon],
            zoom: 16,
            controls: ['routeButtonControl', 'trafficControl', 'fullscreenControl']
            });
            
            let myPlacemark = new ymaps.GeoObject({
                geometry: {
                    type: "Point",
                    coordinates: [lat, lon]
                    }
                });

            myMap.geoObjects.add(myPlacemark); 
            }
        },
        error => {
            console.log(error);
        }
    )      
})