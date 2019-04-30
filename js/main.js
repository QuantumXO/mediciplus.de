
document.addEventListener('DOMContentLoaded', function () {

    const searchField = document.getElementById('searchField');
    const searchFind = document.getElementById('searchFind');
    const searchClear = document.getElementById('searchClear');

    searchFind.addEventListener('click', function () {
        //
    });

    searchClear.addEventListener('click', function () {
        searchField.value = null;
    });

});


function initMap() {

    const hospitalIcon = "./img/hospital.png";
    const hospitalIconWidth = 26;
    const hospitalIconHeight = 33.8;
    const doctorIcon = "./img/doctor.png";
    const doctorIconWidth = 26;
    const doctorIconHeight = 33.8;
    const options = {
        center: {lat: 50.431275, lng: 30.516910}, //{lat: -34.397, lng: 150.644}
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    let marker,
        allMarkers = [],
        popUpIsActive = null,
        activeMarker;
    let animationMarkerInterval;

    const map = new google.maps.Map(document.getElementById('map'), options);
    const locations = [
        {
            title: 'ЛОР центр',
            position: {lat: 50.418861, lng: 30.526437},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
             },
            schedule: '00:00–00:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.418861,
            lng: 30.526437
        },
        {
            title: 'Киевская городская клиническая больница №17',
            position: {lat: 50.428157, lng: 30.527383},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.428157,
            lng: 30.527383,
        },
        {
            title: 'Doctor',
            position: {lat: 50.424270, lng: 30.516910},
            icon: {
                url: doctorIcon,
                scaledSize: new google.maps.Size(doctorIconWidth, doctorIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'doctor',
            name: 'Иванов иван иванович',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.424270,
            lng: 30.516910,
        },
        {
            title: 'Больница2',
            position: {lat: 50.441555, lng: 30.527385},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.441555,
            lng: 30.527385,
        },
        {
            title: 'Больница3',
            position: {lat: 50.424160, lng: 30.481633},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.424160,
            lng: 30.481633,
        },
        {
            title: 'Больница4',
            position: {lat: 50.445192, lng: 30.516832},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'hospital',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.445192,
            lng: 30.516832,
        },
    ];

    locations.forEach( function( element, i ) {

        marker = new google.maps.Marker({
            position: element.position,
            map: map,
            animation: google.maps.Animation.DROP,
            title: element.title,
            icon: element.icon,
            type: element.type,
            schedule: element.schedule,
            address: element.address,
            lat: element.lat,
            lng: element.lng,
            id: i,
            name: element.name || null,
            //animation: google.maps.Animation.BOUNCE,
        });

        allMarkers.push(marker);

    });

    renderList(allMarkers);

    allMarkers.forEach(function (item) {

        item.addListener('click', function() {

            renderPopUp(item);

            item.setAnimation(null);

        });

    });

    function renderPopUp(item) {

        if(popUpIsActive){
            popUpIsActive.close();
        }

        const {title} = item; // item data

        let infoWindowContent = `
            <div class="popUp">
                <h3>${title}</h3>
            </div>
                
        `;

        const infowindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });

        infowindow.open(map, item);

        popUpIsActive = infowindow;

    }

    function renderList(markersList){

        const resultList = document.getElementById('resultList');
        const resultListFragment = document.createDocumentFragment();
        const allMarkersLength = markersList.length;

        let newReultItem,
            type;

        resultList.innerHTML = ''; // Clear list

        if(allMarkersLength){
            for(let i = 0; i < allMarkersLength; i++){

                type = markersList[i].type == 'hospital' ? 'Больница' : 'Врач';

                newReultItem = document.createElement('li');
                newReultItem.classList.add('filter__result__item');
                newReultItem.innerHTML = `
                <h3 class="title">
                    <a 
                        href="#" 
                        class="to-center-link js-to-center-link" 
                        data-lat="${markersList[i].lat}" 
                        data-lng="${markersList[i].lng}"
                        data-marker-id="${markersList[i].id}"
                    >
                        ${markersList[i].title}
                    </a>
                </h3>
                <p class="info">Открыто:&nbsp;<span class="value">${markersList[i].schedule}</span>,&nbsp; <span class="type hospital">${type}</span></p>
                <p class="address">${markersList[i].address}</p>
                <div class="bottom">
                    <a href="#" class="direction">Проложить маршрут</a>
                    <a href="#" class="more">Подробнее</a>
                </div>
            `;

                resultListFragment.appendChild(newReultItem);
            }

            resultList.appendChild(resultListFragment);
        }else{
            //resultList.innerHTML = '<li class="filter__result__item">not found</li>';
            resultList.innerHTML = 'not found';
        }


    }

    function linkToCenterItem(map){

        const resultItemsLinks = document.getElementsByClassName('js-to-center-link');
        const resultItemsArr = [].slice.call(resultItemsLinks);

        let lat,
            lng,
            id;
        let center;

        document.addEventListener('click', function (e) {
            const target = e.target;

            if(target.classList.contains('js-to-center-link')){
                setActiveMarker(target);
            }
        });

        function setActiveMarker($this) {

            if(activeMarker){
                clearInterval(animationMarkerInterval);
                activeMarker.setAnimation(null);
            }

            lat = $this.getAttribute('data-lat');
            lng = $this.getAttribute('data-lng');
            id = $this.getAttribute('data-marker-id');

            center = new google.maps.LatLng(lat, lng);
            map.panTo(center);

            let i = 0;

            animationMarkerInterval = setInterval(function () {
                i++;
                allMarkers[id].setAnimation(google.maps.Animation.BOUNCE);

                if(i == 10){
                    clearInterval(animationMarkerInterval);
                }
            }, 150);
            activeMarker = allMarkers[id];

        }

    }

    linkToCenterItem(map);

    function search() {
        const searField = document.getElementById('searchField');
        const markersList = allMarkers;

        //console.log('search() -> ', allMarkers);

        searchField.addEventListener('keyup', function (e) {

            const searchValue = this.value.toLowerCase();

            let newMarkersList = [];

            if(searchValue){

                console.log('searchValue: ', searchValue);

                markersList.forEach(function(item) {
                    let {address, title, name} = item;

                    address = address.toLowerCase();
                    title = title.toLowerCase();
                    name = name ? name.toLowerCase() : null;

                    if( address.match(searchValue) ||
                        title.match(searchValue) ||
                        (name && name.match(searchValue))
                    ){
                        newMarkersList.push(item);
                    }
                });

            }else{
                newMarkersList = allMarkers;
            }

            console.log('newMarkersList[]: ', newMarkersList);
            renderList(newMarkersList);
        });


    }
    search();


}