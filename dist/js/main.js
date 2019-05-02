
document.addEventListener('DOMContentLoaded', function () {

    const searchClear = document.getElementById('searchClear');


});


function initMap() {

    const searField = document.getElementById('searchField');
    const filterBtnsWrap = document.getElementsByClassName('js-filter-btns-wrap')[0];
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
    const animationDrop = google.maps.Animation.DROP;

    let marker,
        allMarkers = [],
        popUpIsActive = null,
        activeMarker,
        activeFilter = 'all',
        animationMarkerInterval;
    let searchValue;

    const map = new google.maps.Map(document.getElementById('map'), options);
    const locations = [
        {
            id: 0,
            title: 'ЛОР центр',
            position: {lat: 50.418861, lng: 30.526437},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
             },
            schedule: '00:00–00:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.418861,
            lng: 30.526437,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 1,
            title: 'Киевская городская клиническая больница №17',
            position: {lat: 50.428157, lng: 30.527383},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.428157,
            lng: 30.527383,
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 2,
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
            dutyClinic: true,
            aussendienst: false,
        },
        {
            id: 3,
            title: 'Больница2',
            position: {lat: 50.441555, lng: 30.527385},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.441555,
            lng: 30.527385,
            dutyClinic: true,
            aussendienst: true,
        },
        {
            id: 4,
            title: 'Больница3',
            position: {lat: 50.424160, lng: 30.481633},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.424160,
            lng: 30.481633,
            dutyClinic: false,
            aussendienst: false,
        },
        {
            id: 5,
            title: 'Больница4',
            position: {lat: 50.445192, lng: 30.516832},
            icon: {
                url: hospitalIcon,
                scaledSize: new google.maps.Size(hospitalIconWidth, hospitalIconHeight)
            },
            schedule: '08:00–20:00',
            type: 'clinic',
            address: '14, вул. Кутузова, Киев, 02000',
            lat: 50.445192,
            lng: 30.516832,
            dutyClinic: false,
            aussendienst: false,
        },
    ];

    function setMarkers(locations, animation){

        if(allMarkers){
            removeMarkers();
        }

        locations.forEach( function( element, i ) {

            marker = new google.maps.Marker({
                position: element.position,
                map: map,
                animation: animation,
                title: element.title,
                icon: element.icon,
                type: element.type,
                schedule: element.schedule,
                address: element.address,
                lat: element.lat,
                lng: element.lng,
                id: element.id,
                name: element.name || null,
                //animation: google.maps.Animation.BOUNCE,
            });

            allMarkers.push(marker);

            //console.log('setMarkers() -> allMarkers', allMarkers);

            allMarkers.forEach(function (item) {

                item.addListener('click', function() {

                    renderPopUp(item);

                    item.setAnimation(null);

                });

            });

        });

        //renderList(allMarkers); // renders list of markers
    }

    setMarkers(locations, animationDrop); // first init of markers

    function removeMarkers(){

        for(let i = 0; i < allMarkers.length ; i++){
            allMarkers[i].setMap(null);
        }

        allMarkers = [];
    }
    
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

        console.log('allMarkers: ', allMarkers);

        const resultList = document.getElementById('resultList');
        const resultListFragment = document.createDocumentFragment();
        const allMarkersLength = markersList.length;

        let newReultItem,
            type;

        resultList.innerHTML = ''; // Clear list

        if(allMarkersLength){
            for(let i = 0; i < allMarkersLength; i++){

                type = markersList[i].type == 'clinic' ? 'Больница' : 'Врач';

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


    search(allMarkers); // as fix

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

            console.log('setActiveMarker() -> $this', $this);

            animationMarkerInterval = setInterval(function () {
                i++;



                for(let i = 0; i < allMarkers.length; i++){
                    if(allMarkers[i].id == id){
                        allMarkers[i].setAnimation(google.maps.Animation.BOUNCE);
                        activeMarker = allMarkers[i];
                    }
                }
                if(i === 10){
                    clearInterval(animationMarkerInterval);
                }
            }, 150);


        }

    }

    linkToCenterItem(map);

    function search(allMarkers) {

        const markersList = allMarkers;

        //console.log('search() -> searchValue: ', searchValue);

        searchValue = searField.value.toLowerCase();

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
        renderList(newMarkersList);

    }

    searchField.addEventListener('keyup', function () {

        search(allMarkers);

    });

    searchClear.addEventListener('click', function () {
        searchField.value = null;
        search(allMarkers);
    });

    filterBtnsWrap.addEventListener('click', function (e) {
        const target = e.target;

        if(target.classList.contains('js-all')){
            filter('all');
        }else if(target.classList.contains('js-clinic')){
            filter('clinic');
        }else if(target.classList.contains('js-doctor')){
            filter('doctor');
        }else if(target.classList.contains('js-duty-Clinic')){
            filter('dutyClinic');
        }else if(target.classList.contains('js-aussendienst')){
            filter('aussendienst');
        }
    });

    function filter(type) {

        let locFilterArr = [];


        if(type == 'all'){
            locFilterArr = locations;
        }else if(type == 'clinic' || type == 'doctor'){
            locFilterArr = locations.filter(item => item.type === type);
        }else if(type == 'dutyClinic'){
            locFilterArr = locations.filter(item => item.dutyClinic);
        }else if(type == 'aussendienst'){
            locFilterArr = locations.filter(item => item.aussendienst);
        }

        if(activeFilter !== type){
            removeMarkers();
            setMarkers(locFilterArr, animationDrop);
            search(locFilterArr);

            activeFilter = type;
        }

    }

}